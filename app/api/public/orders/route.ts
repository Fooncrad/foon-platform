import { z } from 'zod';
import { database } from '@/db';
import { ApiError, sameOrigin } from '@/lib/platform/security';
import { requireTenantFeature } from '@/lib/platform/entitlements';
import { priceMenuSelection } from '@/lib/restaurant/menu-pricing';
import { sendAutomaticMessage } from '@/lib/platform/delivery';

export const dynamic = 'force-dynamic';
const inputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,59}$/),
  clientRequestId: z.string().uuid(), customerName: z.string().trim().min(2).max(160),
  customerPhone: z.string().trim().min(5).max(32),
  customerEmail: z.union([z.string().trim().email().max(254), z.literal('')]).optional().default(''),
  orderType: z.enum(['pickup', 'takeaway', 'dine_in', 'delivery', 'room_service', 'reservation']),
  serviceReference: z.string().trim().max(80).optional().default(''),
  roomNumber: z.string().trim().max(40).optional().default(''),
  pickupLabel: z.string().trim().max(160).optional().default(''),
  pickupPointId: z.string().uuid().optional(),
  reservationId: z.string().uuid().optional(),
  waiterReference: z.string().trim().max(80).optional().default(''),
  deliveryAddress: z.string().trim().max(500).optional().default(''),
  deliveryLat: z.number().min(-90).max(90).optional(),
  deliveryLng: z.number().min(-180).max(180).optional(),
  tableToken: z.string().trim().regex(/^[a-f0-9]{32}$/).optional(),
  notes: z.string().trim().max(1000).optional().default(''), locale: z.enum(['ar', 'en', 'fr']).default('ar'),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(99), variantId: z.string().uuid().optional(), options: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).max(100).default([]) })).min(1).max(50)
});
function fail(error: unknown) {
  if (error instanceof ApiError) return Response.json({ error: error.code }, { status: error.status });
  if (error instanceof z.ZodError) return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
  console.error('Public order failed', error instanceof Error ? error.name : 'Unknown');
  return Response.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 });
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const raw = await request.text();
    if (raw.length > 12000) throw new ApiError(413, 'INPUT_TOO_LARGE');
    let untrusted: unknown;
    try { untrusted = JSON.parse(raw); } catch { throw new ApiError(400, 'INVALID_INPUT'); }
    const input = inputSchema.parse(untrusted);
    const tenant = await database().prepare("SELECT id,currency,name FROM tenants WHERE slug=? AND activity_id='restaurants' AND status='active' LIMIT 1").bind(input.slug).first<{ id: string; currency: string; name:string }>();
    if (!tenant) throw new ApiError(404, 'NOT_FOUND');
    try{const setting=await database().prepare('SELECT enabled FROM restaurant_order_type_settings WHERE tenant_id=? AND order_type=? LIMIT 1').bind(tenant.id,input.orderType).first<{enabled:number}>();if(setting&&!Number(setting.enabled))throw new ApiError(403,'ORDER_TYPE_DISABLED')}catch(error){if(error instanceof ApiError)throw error;}
    await requireTenantFeature(tenant.id, 'orders');
    const featureForType:Record<string,string>={pickup:'pickup',takeaway:'pickup',dine_in:'orders',delivery:'delivery',room_service:'room_service',reservation:'reservations'};
    const requiredFeature=featureForType[input.orderType]; if(requiredFeature&&requiredFeature!=='orders') await requireTenantFeature(tenant.id, requiredFeature);
    const policy=await database().prepare('SELECT min_order,service_fee,service_fee_label_ar,service_fee_label_en,service_fee_label_fr,max_active_orders,requires_driver FROM restaurant_order_policies WHERE tenant_id=? AND order_type=? LIMIT 1').bind(tenant.id,input.orderType).first<{min_order:number|string;service_fee:number|string;service_fee_label_ar:string|null;service_fee_label_en:string|null;service_fee_label_fr:string|null;max_active_orders:number|string|null;requires_driver:number|string}>().catch(()=>null);
    try{const jsDay=new Date().getDay(),h=await database().prepare('SELECT open_time,close_time,closed FROM restaurant_business_hours WHERE tenant_id=? AND day_of_week=? LIMIT 1').bind(tenant.id,jsDay).first<{open_time:string|null;close_time:string|null;closed:number}>();if(h){if(Number(h.closed))throw new ApiError(409,'STORE_CLOSED');if(h.open_time&&h.close_time){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),hm=(parts.find(x=>x.type==='hour')?.value||'00')+':'+(parts.find(x=>x.type==='minute')?.value||'00'),open=h.open_time,close=h.close_time,inside=open<=close?(hm>=open&&hm<=close):(hm>=open||hm<=close);if(!inside)throw new ApiError(409,'STORE_CLOSED')}}}catch(error){if(error instanceof ApiError)throw error;}
    if(policy?.max_active_orders){const active=await database().prepare("SELECT COUNT(*) c FROM restaurant_orders WHERE tenant_id=? AND order_type=? AND status IN ('new','pending','confirmed','preparing')").bind(tenant.id,input.orderType).first<{c:number|string}>();if(Number(active?.c||0)>=Number(policy.max_active_orders))throw new ApiError(409,'ORDER_CAPACITY_REACHED')}
    if(input.orderType==='delivery'&&Number(policy?.requires_driver)){const cap=await database().prepare('SELECT available_drivers FROM restaurant_delivery_capacity WHERE tenant_id=?').bind(tenant.id).first<{available_drivers:number|string}>().catch(()=>null);if(Number(cap?.available_drivers||0)<=0)throw new ApiError(409,'NO_DRIVER_AVAILABLE')}
    if (input.orderType === 'dine_in' && !input.serviceReference && !input.tableToken) throw new ApiError(400, 'TABLE_REFERENCE_REQUIRED');
    if (input.orderType === 'room_service' && !input.roomNumber && !input.serviceReference) throw new ApiError(400, 'ROOM_NUMBER_REQUIRED');
    if (input.orderType === 'delivery' && !input.deliveryAddress) throw new ApiError(400, 'DELIVERY_ADDRESS_REQUIRED');
    if (input.orderType === 'reservation' && !input.reservationId && !input.serviceReference) throw new ApiError(400, 'RESERVATION_REFERENCE_REQUIRED');
    const clientRequestId = `menu-${input.clientRequestId}`;
    const existing = await database().prepare('SELECT id,reference,status,total,currency FROM restaurant_orders WHERE tenant_id=? AND client_request_id=? LIMIT 1').bind(tenant.id, clientRequestId).first<Record<string, unknown>>();
    if (existing) return Response.json({ order: existing, duplicate: true });

    const lines = await Promise.all(input.items.map(async line => ({ ...line, ...await priceMenuSelection(tenant.id, line.id, { variantId: line.variantId, options: line.options, locale: input.locale, quantity: line.quantity }) })));
    let totalCents = 0, subtotalCents = 0, taxCents = 0;
    for (const line of lines) { totalCents += line.unitCents * line.quantity; subtotalCents += line.subtotalCents * line.quantity; taxCents += line.taxCents * line.quantity; }
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) throw new ApiError(400, 'INVALID_TOTAL');
    let appliedFee=Number(policy?.service_fee||0);let appliedMin=Number(policy?.min_order||0);
    if(input.tableToken){const tablePolicy=await database().prepare('SELECT min_order,service_fee FROM restaurant_table_runtime WHERE tenant_id=? AND qr_token=? LIMIT 1').bind(tenant.id,input.tableToken).first<{min_order:number|string|null;service_fee:number|string|null}>();if(tablePolicy?.min_order!=null)appliedMin=Number(tablePolicy.min_order);if(tablePolicy?.service_fee!=null)appliedFee=Number(tablePolicy.service_fee)}
    if(totalCents<Math.round(appliedMin*100))throw new ApiError(409,'MINIMUM_ORDER_NOT_MET');
    if(appliedFee>0)totalCents+=Math.round(appliedFee*100);
    let table:null|{id:string;branch_id:string;table_number:string;enabled:number}=null;
    if(input.tableToken){table=await database().prepare('SELECT tb.id,tb.branch_id,tb.table_number,tb.enabled FROM restaurant_table_runtime rt JOIN restaurant_tables tb ON tb.id=rt.table_id AND tb.tenant_id=rt.tenant_id WHERE rt.tenant_id=? AND rt.qr_token=? LIMIT 1').bind(tenant.id,input.tableToken).first<{id:string;branch_id:string;table_number:string;enabled:number}>()||null;if(!table||!Number(table.enabled))throw new ApiError(400,'INVALID_TABLE_QR');if(input.orderType!=='dine_in')throw new ApiError(400,'TABLE_QR_REQUIRES_DINE_IN')}
    const branch = table?{id:table.branch_id}:await database().prepare('SELECT id FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,id ASC LIMIT 1').bind(tenant.id).first<{ id: string }>();
    if (!branch) throw new ApiError(409, 'BRANCH_REQUIRED');
    const serviceReference=table?table.table_number:input.serviceReference;
    const id = crypto.randomUUID(), reference = `FN-${Date.now().toString(36).toUpperCase()}-${id.slice(0, 6).toUpperCase()}`, now = Date.now(), amount = (totalCents / 100).toFixed(2);
    try {
      await database().transaction(async tx => {
        const stockByItem = new Map<string, number>();
        for (const line of lines) stockByItem.set(line.id, (stockByItem.get(line.id) || 0) + line.quantity);
        for (const [itemId, quantity] of stockByItem) {
          const stock = await tx.prepare('SELECT track_inventory,stock_quantity FROM menu_items WHERE id=? AND tenant_id=? FOR UPDATE').bind(itemId, tenant.id).first<{ track_inventory: number | string; stock_quantity: number | string }>();
          if (!stock) throw new ApiError(409, 'MENU_CHANGED');
          if (Number(stock.track_inventory) > 0) {
            if (Number(stock.stock_quantity) < quantity) throw new ApiError(409, 'ITEM_OUT_OF_STOCK');
            await tx.prepare('UPDATE menu_items SET stock_quantity=stock_quantity-?,updated_at=? WHERE id=? AND tenant_id=?').bind(quantity, Date.now(), itemId, tenant.id).run();
          }
        }
        const stockByOption = new Map<string, number>();
        for (const line of lines) for (const option of line.options) stockByOption.set(option.id, (stockByOption.get(option.id) || 0) + option.quantity * line.quantity);
        for (const [optionId, quantity] of stockByOption) {
          const stock = await tx.prepare('SELECT stock_quantity FROM menu_addon_options WHERE id=? AND tenant_id=? FOR UPDATE').bind(optionId, tenant.id).first<{ stock_quantity: number | string }>();
          if (!stock) throw new ApiError(409, 'MENU_CHANGED');
          if (Number(stock.stock_quantity) > 0) {
            if (Number(stock.stock_quantity) < quantity) throw new ApiError(409, 'ADDON_OUT_OF_STOCK');
            await tx.prepare('UPDATE menu_addon_options SET stock_quantity=stock_quantity-? WHERE id=? AND tenant_id=?').bind(quantity, optionId, tenant.id).run();
          }
        }
        await tx.prepare('INSERT INTO restaurant_orders(id,tenant_id,branch_id,reference,source,source_label,status,customer_name,customer_phone,subtotal,tax_amount,total,currency,client_request_id,order_type,service_reference,room_number,pickup_label,pickup_point_id,reservation_id,waiter_reference,delivery_address,delivery_lat,delivery_lng,customer_email,notes,customer_locale,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, tenant.id, branch.id, reference, input.waiterReference?'waiter':input.reservationId?'reservation':input.orderType==='room_service'?'hotel':input.pickupPointId?'pickup_point':'menu', input.waiterReference?'Waiter':input.reservationId?'Reservation':input.orderType==='room_service'?'Hotel':input.pickupPointId?'Pickup point':'Menu', 'new', input.customerName, input.customerPhone, (subtotalCents / 100).toFixed(2), (taxCents / 100).toFixed(2), amount, tenant.currency, clientRequestId, input.orderType, serviceReference || null, input.roomNumber || null, input.pickupLabel || null, input.pickupPointId || null, input.reservationId || null, input.waiterReference || null, input.deliveryAddress || null, input.deliveryLat ?? null, input.deliveryLng ?? null, input.customerEmail || null, input.notes || null, input.locale, now, now).run();
        await tx.prepare("INSERT INTO restaurant_order_status_history(id,tenant_id,order_id,from_status,to_status,reason,actor_id,created_at) VALUES(?,?,?,NULL,'new',NULL,NULL,?)").bind(crypto.randomUUID(),tenant.id,id,now).run();
        if(table)await tx.prepare("UPDATE restaurant_table_runtime SET status='busy',service_started_at=COALESCE(service_started_at,?),updated_at=? WHERE tenant_id=? AND table_id=?").bind(now,now,tenant.id,table.id).run();
        if(appliedFee>0){const feeLabel=input.locale==='en'?policy?.service_fee_label_en:input.locale==='fr'?policy?.service_fee_label_fr:policy?.service_fee_label_ar;await tx.prepare("INSERT INTO restaurant_order_fees(id,tenant_id,order_id,fee_type,label_ar,label_en,label_fr,calculation_type,rate,amount,taxable,created_at) VALUES(?,?,?,'service',?,?,?,'fixed',NULL,?,0,?)").bind(crypto.randomUUID(),tenant.id,id,policy?.service_fee_label_ar||null,policy?.service_fee_label_en||null,policy?.service_fee_label_fr||null,appliedFee.toFixed(2),now).run();}
        for (const line of lines) {const orderItemId=crypto.randomUUID();await tx.prepare('INSERT INTO restaurant_order_items(id,order_id,menu_item_id,item_name,quantity,unit_price,line_total,tax_amount) VALUES(?,?,?,?,?,?,?,?)').bind(orderItemId, id, line.id, line.itemName, line.quantity, (line.unitCents / 100).toFixed(2), (line.unitCents * line.quantity / 100).toFixed(2), (line.taxCents * line.quantity / 100).toFixed(2)).run();for(const selected of line.options){const priced=line.selectedOptions.find(x=>x.id===selected.id);await tx.prepare('INSERT INTO restaurant_order_item_options(id,order_item_id,addon_group_id,addon_option_id,variant_id,option_name,quantity,unit_price,line_total,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),orderItemId,priced?.groupId||null,selected.id,line.variantId||null,priced?.name||'Option',selected.quantity,((priced?.unitCents||0)/100).toFixed(2),(((priced?.unitCents||0)*selected.quantity*line.quantity)/100).toFixed(2),now).run();}}
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        const raced = await database().prepare('SELECT id,reference,status,total,currency FROM restaurant_orders WHERE tenant_id=? AND client_request_id=? LIMIT 1').bind(tenant.id, clientRequestId).first<Record<string, unknown>>();
        if (raced) return Response.json({ order: raced, duplicate: true });
      }
      throw error;
    }
    if(input.customerEmail) await sendAutomaticMessage({tenantId:tenant.id,event:'order_received',locale:input.locale,recipient:input.customerEmail,variables:{customer_name:input.customerName,store_name:tenant.name,service_name:'restaurant',service_number:reference,service_type:input.orderType,amount,currency:tenant.currency,date:new Date(now).toISOString(),plan_name:'',expires_at:''},idempotencyKey:id});
    return Response.json({ order: { id, reference, status: 'new', total: amount, currency: tenant.currency }, duplicate: false }, { status: 201 });
  } catch (error) { return fail(error); }
}

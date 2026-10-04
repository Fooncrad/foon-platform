import { apiErrorResponse } from '@/lib/platform/error-reporting';
import { z } from 'zod';
import { database } from '@/db';
import { ApiError, audit, authorize, sameOrigin } from '@/lib/platform/security';
import { requireTenantFeature } from '@/lib/platform/entitlements';
import { priceMenuSelection } from '@/lib/restaurant/menu-pricing';
import {enforceOrderLimit} from '@/lib/restaurant/order-quota';

export const dynamic = 'force-dynamic';
const body = z.object({
  slug: z.string().min(1).max(60), clientRequestId: z.string().min(8).max(80), customerName: z.string().trim().max(160).optional(),
  orderType: z.enum(['dine_in', 'pickup', 'room_service']).default('dine_in'), tableId: z.string().uuid().nullable().optional(),
  roomNumber: z.string().trim().max(40).optional(), pickupLabel: z.string().trim().max(160).optional(), locale: z.enum(['ar', 'en', 'fr']).default('ar'),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(100), variantId: z.string().uuid().optional(), options: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).max(100).default([]) })).min(1).max(100)
});
function fail(error: unknown) { return apiErrorResponse(error, '/app/api/restaurant/pos'); }
async function tenant(slug: string) {
  const result = await database().prepare("SELECT id,currency FROM tenants WHERE slug=? AND activity_id='restaurants' LIMIT 1").bind(slug).first<{ id: string; currency: string }>();
  if (!result) throw new ApiError(404, 'NOT_FOUND');
  const user = await authorize(result.id); await requireTenantFeature(result.id, 'pos');
  return { ...result, userId: user.userId };
}

export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug') || '', current = await tenant(slug);
    const [items, variants, groups, options, tables] = await Promise.all([
      database().prepare("SELECT i.id,i.category_id,i.name_ar,i.name_en,i.name_fr,i.price,i.discount_price,i.tax_rate,i.tax_included,i.stock_quantity,i.track_inventory,i.dietary_type,i.image_url,c.name_ar category_ar,c.name_en category_en,c.name_fr category_fr FROM menu_items i JOIN menu_categories c ON c.id=i.category_id AND c.tenant_id=i.tenant_id WHERE i.tenant_id=? AND i.enabled=1 AND c.enabled=1 AND (i.track_inventory=0 OR i.stock_quantity>0) ORDER BY c.sort_order,i.sort_order,i.created_at").bind(current.id).all(),
      database().prepare('SELECT id,item_id,name_ar,name_en,name_fr,price_delta FROM menu_item_variants WHERE tenant_id=? AND enabled=1 ORDER BY sort_order').bind(current.id).all(),
      database().prepare('SELECT id,item_id,title_ar,title_en,title_fr,selection_type,is_required,min_select,max_select,max_qty FROM menu_addon_groups WHERE tenant_id=? AND enabled=1 ORDER BY sort_order').bind(current.id).all(),
      database().prepare('SELECT id,group_id,name_ar,name_en,name_fr,price_delta FROM menu_addon_options WHERE tenant_id=? AND enabled=1 ORDER BY sort_order').bind(current.id).all(),
      database().prepare('SELECT id,table_number,section_name,capacity FROM restaurant_tables WHERE tenant_id=? AND enabled=1 ORDER BY section_name,table_number').bind(current.id).all()
    ]);
    const byGroup = new Map<string, unknown[]>();
    for (const option of options.results as Array<{ group_id: string }>) byGroup.set(option.group_id, [...(byGroup.get(option.group_id) || []), option]);
    const byItem = new Map<string, unknown[]>();
    for (const group of groups.results as Array<{ id: string; item_id: string }>) byItem.set(group.item_id, [...(byItem.get(group.item_id) || []), { ...group, options: byGroup.get(group.id) || [] }]);
    const variantsByItem = new Map<string, unknown[]>();
    for (const variant of variants.results as Array<{ item_id: string }>) variantsByItem.set(variant.item_id, [...(variantsByItem.get(variant.item_id) || []), variant]);
    return Response.json({ items: (items.results as Array<{ id: string }>).map(item => ({ ...item, addon_groups: byItem.get(item.id) || [], variants: variantsByItem.get(item.id) || [] })), tables: tables.results, currency: current.currency });
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const raw = await request.text(); if (raw.length > 50000) throw new ApiError(413, 'INPUT_TOO_LARGE');
    const input = body.parse(JSON.parse(raw));
    if (input.orderType === 'room_service' && !input.roomNumber) throw new ApiError(400, 'ROOM_NUMBER_REQUIRED');
    const current = await tenant(input.slug);
    const existing = await database().prepare('SELECT id,reference,status,total,currency FROM restaurant_orders WHERE tenant_id=? AND client_request_id=? LIMIT 1').bind(current.id, input.clientRequestId).first();
    if (existing) return Response.json({ order: existing, idempotent: true });
    if (input.orderType === 'dine_in' && input.tableId && !await database().prepare('SELECT id FROM restaurant_tables WHERE id=? AND tenant_id=? AND enabled=1 LIMIT 1').bind(input.tableId, current.id).first()) throw new ApiError(409, 'TABLE_UNAVAILABLE');
    const branch = await database().prepare('SELECT id FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,id ASC LIMIT 1').bind(current.id).first<{ id: string }>();
    if (!branch) throw new ApiError(409, 'BRANCH_REQUIRED');
    const lines = await Promise.all(input.items.map(async line => ({ ...line, ...await priceMenuSelection(current.id, line.id, { variantId: line.variantId, options: line.options, locale: input.locale, quantity: line.quantity }) })));
    let totalCents = 0, subtotalCents = 0, taxCents = 0;
    for (const line of lines) { totalCents += line.unitCents * line.quantity; subtotalCents += line.subtotalCents * line.quantity; taxCents += line.taxCents * line.quantity; }
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) throw new ApiError(400, 'INVALID_TOTAL');
    const total = (totalCents / 100).toFixed(2), id = crypto.randomUUID(), reference = `POS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`, now = Date.now();
    await database().transaction(async tx => {
      await enforceOrderLimit(tx,current.id);
      const stockByItem = new Map<string, number>();
      for (const line of lines) stockByItem.set(line.id, (stockByItem.get(line.id) || 0) + line.quantity);
      for (const [itemId, quantity] of stockByItem) {
        const stock = await tx.prepare('SELECT track_inventory,stock_quantity FROM menu_items WHERE id=? AND tenant_id=? FOR UPDATE').bind(itemId, current.id).first<{ track_inventory: number | string; stock_quantity: number | string }>();
        if (!stock) throw new ApiError(409, 'MENU_CHANGED');
        if (Number(stock.track_inventory) > 0) {
          if (Number(stock.stock_quantity) < quantity) throw new ApiError(409, 'ITEM_OUT_OF_STOCK');
          await tx.prepare('UPDATE menu_items SET stock_quantity=stock_quantity-?,updated_at=? WHERE id=? AND tenant_id=?').bind(quantity, Date.now(), itemId, current.id).run();
        }
      }
      const stockByOption = new Map<string, number>();
      for (const line of lines) for (const option of line.options) stockByOption.set(option.id, (stockByOption.get(option.id) || 0) + option.quantity * line.quantity);
      for (const [optionId, quantity] of stockByOption) {
        const stock = await tx.prepare('SELECT stock_quantity FROM menu_addon_options WHERE id=? AND tenant_id=? FOR UPDATE').bind(optionId, current.id).first<{ stock_quantity: number | string }>();
        if (!stock) throw new ApiError(409, 'MENU_CHANGED');
        if (Number(stock.stock_quantity) > 0) {
          if (Number(stock.stock_quantity) < quantity) throw new ApiError(409, 'ADDON_OUT_OF_STOCK');
          await tx.prepare('UPDATE menu_addon_options SET stock_quantity=stock_quantity-? WHERE id=? AND tenant_id=?').bind(quantity, optionId, current.id).run();
        }
      }
      await tx.prepare("INSERT INTO restaurant_orders(id,tenant_id,branch_id,reference,source,status,customer_name,subtotal,tax_amount,total,currency,client_request_id,order_type,table_id,room_number,pickup_label,created_at,updated_at) VALUES(?,?,?,?,?,'confirmed',?,?,?,?,?,?,?,?,?,?,?,?)").bind(id, current.id, branch.id, reference, 'pos', input.customerName || null, (subtotalCents / 100).toFixed(2), (taxCents / 100).toFixed(2), total, current.currency, input.clientRequestId, input.orderType, input.orderType === 'dine_in' ? input.tableId || null : null, input.orderType === 'room_service' ? input.roomNumber || null : null, input.orderType === 'pickup' ? input.pickupLabel || null : null, now, now).run();
      for (const line of lines) await tx.prepare('INSERT INTO restaurant_order_items(id,order_id,menu_item_id,item_name,quantity,unit_price,line_total,tax_amount) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), id, line.id, line.itemName, line.quantity, (line.unitCents / 100).toFixed(2), (line.unitCents * line.quantity / 100).toFixed(2), (line.taxCents * line.quantity / 100).toFixed(2)).run();
    });
    await audit(current.userId, 'restaurant.pos.order_created', current.id);
    return Response.json({ order: { id, reference, status: 'confirmed', total, currency: current.currency } }, { status: 201 });
  } catch (error) { return fail(error); }
}

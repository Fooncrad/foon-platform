import { z } from 'zod';
import { database } from '@/db';
import { ApiError, sameOrigin } from '@/lib/platform/security';
import { requireTenantFeature } from '@/lib/platform/entitlements';
import { priceMenuSelection } from '@/lib/restaurant/menu-pricing';

export const dynamic = 'force-dynamic';
const inputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,59}$/),
  clientRequestId: z.string().uuid(), customerName: z.string().trim().min(2).max(160),
  customerPhone: z.string().trim().min(5).max(32),
  customerEmail: z.union([z.string().trim().email().max(254), z.literal('')]).optional().default(''),
  orderType: z.enum(['pickup', 'dine_in', 'room_service']),
  serviceReference: z.string().trim().max(80).optional().default(''),
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
    const tenant = await database().prepare("SELECT id,currency FROM tenants WHERE slug=? AND activity_id='restaurants' AND status='active' LIMIT 1").bind(input.slug).first<{ id: string; currency: string }>();
    if (!tenant) throw new ApiError(404, 'NOT_FOUND');
    await requireTenantFeature(tenant.id, 'orders');
    await requireTenantFeature(tenant.id, input.orderType);
    if (input.orderType !== 'pickup' && !input.serviceReference) throw new ApiError(400, 'SERVICE_REFERENCE_REQUIRED');
    const clientRequestId = `menu-${input.clientRequestId}`;
    const existing = await database().prepare('SELECT id,reference,status,total,currency FROM restaurant_orders WHERE tenant_id=? AND client_request_id=? LIMIT 1').bind(tenant.id, clientRequestId).first<Record<string, unknown>>();
    if (existing) return Response.json({ order: existing, duplicate: true });

    const lines = await Promise.all(input.items.map(async line => ({ ...line, ...await priceMenuSelection(tenant.id, line.id, { variantId: line.variantId, options: line.options, locale: input.locale, quantity: line.quantity }) })));
    let totalCents = 0, subtotalCents = 0, taxCents = 0;
    for (const line of lines) { totalCents += line.unitCents * line.quantity; subtotalCents += line.subtotalCents * line.quantity; taxCents += line.taxCents * line.quantity; }
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) throw new ApiError(400, 'INVALID_TOTAL');
    const branch = await database().prepare('SELECT id FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,id ASC LIMIT 1').bind(tenant.id).first<{ id: string }>();
    if (!branch) throw new ApiError(409, 'BRANCH_REQUIRED');
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
        await tx.prepare('INSERT INTO restaurant_orders(id,tenant_id,branch_id,reference,source,status,customer_name,customer_phone,subtotal,tax_amount,total,currency,client_request_id,order_type,service_reference,customer_email,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, tenant.id, branch.id, reference, 'menu', 'new', input.customerName, input.customerPhone, (subtotalCents / 100).toFixed(2), (taxCents / 100).toFixed(2), amount, tenant.currency, clientRequestId, input.orderType, input.serviceReference || null, input.customerEmail || null, input.notes || null, now, now).run();
        for (const line of lines) await tx.prepare('INSERT INTO restaurant_order_items(id,order_id,menu_item_id,item_name,quantity,unit_price,line_total,tax_amount) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), id, line.id, line.itemName, line.quantity, (line.unitCents / 100).toFixed(2), (line.unitCents * line.quantity / 100).toFixed(2), (line.taxCents * line.quantity / 100).toFixed(2)).run();
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        const raced = await database().prepare('SELECT id,reference,status,total,currency FROM restaurant_orders WHERE tenant_id=? AND client_request_id=? LIMIT 1').bind(tenant.id, clientRequestId).first<Record<string, unknown>>();
        if (raced) return Response.json({ order: raced, duplicate: true });
      }
      throw error;
    }
    return Response.json({ order: { id, reference, status: 'new', total: amount, currency: tenant.currency }, duplicate: false }, { status: 201 });
  } catch (error) { return fail(error); }
}

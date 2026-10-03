import { database } from '@/db';
import { tenantEntitlement } from '@/lib/platform/entitlements';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = (url.searchParams.get('slug') ?? '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(slug)) {
      return Response.json({ error: 'INVALID_SLUG' }, { status: 400 });
    }
    const store = await database().prepare(
      "SELECT id,name,slug,activity_id,country_code,currency,status FROM tenants WHERE slug=? AND activity_id='restaurants' AND status='active' LIMIT 1"
    ).bind(slug).first<Record<string, string>>();
    if (!store) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    const entitlement=await tenantEntitlement(store.id,'menu');
    if(!entitlement.enabled)return Response.json({error:'PLAN_FEATURE_REQUIRED'},{status:403});
    const [categories,items]=await Promise.all([
      database().prepare('SELECT id,name_ar,name_en,name_fr,sort_order FROM menu_categories WHERE tenant_id=? AND enabled=1 ORDER BY sort_order,name_ar').bind(store.id).all(),
      database().prepare('SELECT i.id,i.category_id,i.name_ar,i.name_en,i.name_fr,i.description_ar,i.description_en,i.description_fr,i.price,i.image_url,i.calories FROM menu_items i JOIN menu_categories c ON c.id=i.category_id AND c.tenant_id=i.tenant_id AND c.enabled=1 WHERE i.tenant_id=? AND i.enabled=1 ORDER BY c.sort_order,i.created_at DESC').bind(store.id).all()
    ]);
    return Response.json({ store, categories: categories.results, items: items.results },{headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }
}

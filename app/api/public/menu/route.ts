import { database } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = (url.searchParams.get('slug') ?? '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(slug)) {
      return Response.json({ error: 'INVALID_SLUG' }, { status: 400 });
    }
    const store = await database().prepare(
      "SELECT id,name,slug,activity_id,country_code,currency,status FROM tenants WHERE slug=? AND activity_id='restaurants' LIMIT 1"
    ).bind(slug).first<Record<string, string>>();
    if (!store) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    const categories=await database().prepare('SELECT id,name_ar,name_en,name_fr,sort_order FROM menu_categories WHERE tenant_id=? AND enabled=1 ORDER BY sort_order,name_ar').bind(store.id).all();
    const items=await database().prepare('SELECT id,category_id,name_ar,name_en,name_fr,description_ar,description_en,description_fr,price,image_url,calories FROM menu_items WHERE tenant_id=? AND enabled=1 ORDER BY created_at,id').bind(store.id).all();
    return Response.json({ store, categories: categories.results, items: items.results });
  } catch {
    return Response.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }
}

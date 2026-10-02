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
    return Response.json({ store, categories: [], items: [] });
  } catch {
    return Response.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }
}

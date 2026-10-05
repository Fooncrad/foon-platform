import {z} from 'zod';
import {database} from '@/db';
import {ApiError,audit,authorize,sameOrigin} from '@/lib/platform/security';
import {apiErrorResponse} from '@/lib/platform/error-reporting';
export const dynamic='force-dynamic';
const template=z.enum(['grid','list','gallery']);
const settings=z.object({
 template,
 theme:z.object({primary:z.string().max(20).default('#f28c28'),background:z.string().max(20).default('#ffffff'),corners:z.enum(['rounded','soft','square']).default('rounded')}).optional(),
 actions:z.record(z.string(),z.object({visible:z.boolean(),position:z.enum(['cover','menu','bottom'])})).optional(),
 header:z.enum(['compact','full']).optional(),footer:z.enum(['compact','full']).optional(),
 contact:z.object({phone:z.string().max(40),email:z.string().max(180),whatsapp:z.string().max(40),location:z.string().max(500),instagram:z.string().max(180),tiktok:z.string().max(180),snapchat:z.string().max(180),website:z.string().max(500)}).optional()
}).passthrough();
function fail(e:unknown){return apiErrorResponse(e,'/app/api/restaurant/appearance')}
async function tenant(slug:string){const t=await database().prepare("SELECT id FROM tenants WHERE slug=? AND activity_id='restaurants' LIMIT 1").bind(slug).first<{id:string}>();if(!t)throw new ApiError(404,'NOT_FOUND');const u=await authorize(t.id);return {...t,userId:u.userId}}
export async function GET(req:Request){try{const t=await tenant(new URL(req.url).searchParams.get('slug')||'');const row=await database().prepare('SELECT draft_json,published_json,published_at FROM restaurant_appearance_settings WHERE tenant_id=?').bind(t.id).first<{draft_json:string|null;published_json:string|null;published_at:number|null}>();return Response.json({draft:row?.draft_json?JSON.parse(row.draft_json):null,published:row?.published_json?JSON.parse(row.published_json):null,publishedAt:row?.published_at||null})}catch(e){return fail(e)}}
export async function POST(req:Request){try{sameOrigin(req);const raw=await req.text();if(raw.length>30000)throw new ApiError(413,'INPUT_TOO_LARGE');const body=JSON.parse(raw);const t=await tenant(String(body.slug||''));const value=settings.parse(body.settings);const now=Date.now();const json=JSON.stringify(value);if(body.action==='publish'){await database().prepare('INSERT INTO restaurant_appearance_settings(tenant_id,draft_json,published_json,updated_at,published_at) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE draft_json=VALUES(draft_json),published_json=VALUES(published_json),updated_at=VALUES(updated_at),published_at=VALUES(published_at)').bind(t.id,json,json,now,now).run();await audit(t.userId,'restaurant.appearance.published',t.id);return Response.json({ok:true,publishedAt:now})}if(body.action==='save'){await database().prepare('INSERT INTO restaurant_appearance_settings(tenant_id,draft_json,updated_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE draft_json=VALUES(draft_json),updated_at=VALUES(updated_at)').bind(t.id,json,now).run();await audit(t.userId,'restaurant.appearance.saved',t.id);return Response.json({ok:true})}throw new ApiError(400,'INVALID_ACTION')}catch(e){return fail(e)}}

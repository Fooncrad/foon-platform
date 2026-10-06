import { apiErrorResponse } from '@/lib/platform/error-reporting';
import {z} from 'zod';
import {database} from '@/db';
import {ApiError,audit,authorize,sameOrigin} from '@/lib/platform/security';
export const dynamic='force-dynamic';
const types=['pickup','takeaway','dine_in','delivery','room_service','reservation'] as const;
const schema=z.object({slug:z.string().trim().min(2).max(60),orderType:z.enum(types),enabled:z.boolean()});
function fail(error: unknown) { return apiErrorResponse(error, '/app/api/restaurant/order-type-settings'); }
async function tenant(slug:string){const t=await database().prepare("SELECT id FROM tenants WHERE slug=? AND activity_id='restaurants' LIMIT 1").bind(slug).first<{id:string}>();if(!t)throw new ApiError(404,'NOT_FOUND');const u=await authorize(t.id);return {...t,userId:u.userId}}
export async function POST(req:Request){try{sameOrigin(req);const raw=await req.text();if(raw.length>5000)throw new ApiError(413,'INPUT_TOO_LARGE');const d=schema.parse(JSON.parse(raw)),t=await tenant(d.slug),now=Date.now();await database().prepare('INSERT INTO restaurant_order_type_settings(tenant_id,order_type,enabled,updated_at) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE enabled=VALUES(enabled),updated_at=VALUES(updated_at)').bind(t.id,d.orderType,d.enabled?1:0,now).run();await audit(t.userId,'restaurant.order_type.updated',t.id);return Response.json({ok:true,orderType:d.orderType,enabled:d.enabled})}catch(e){return fail(e)}}

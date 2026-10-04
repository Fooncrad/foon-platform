import {z} from 'zod';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
import {requireTenantFeature} from '@/lib/platform/entitlements';

export const dynamic='force-dynamic';
const inputSchema=z.object({
 slug:z.string().regex(/^[a-z0-9][a-z0-9-]{1,59}$/),
 customerName:z.string().trim().min(2).max(160),
 customerPhone:z.string().trim().min(5).max(32),
 customerEmail:z.union([z.string().trim().email().max(254),z.literal('')]).optional().default(''),
 reservationAt:z.number().int().positive(),
 guests:z.number().int().min(1).max(30),
 notes:z.string().trim().max(1000).optional().default(''),
 locale:z.enum(['ar','en','fr']).default('ar')
});
function fail(error:unknown){if(error instanceof ApiError)return Response.json({error:error.code},{status:error.status});if(error instanceof z.ZodError)return Response.json({error:'INVALID_INPUT'},{status:400});console.error('Public reservation failed',error instanceof Error?error.name:'Unknown');return Response.json({error:'SERVICE_UNAVAILABLE'},{status:503})}
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const raw=await request.text();
  if(raw.length>8000)throw new ApiError(413,'INPUT_TOO_LARGE');
  let untrusted:unknown;
  try{untrusted=JSON.parse(raw)}catch{throw new ApiError(400,'INVALID_INPUT')}
  const input=inputSchema.parse(untrusted);
  const now=Date.now();
  if(input.reservationAt<=now||input.reservationAt>now+7*86400000)throw new ApiError(400,'RESERVATION_DATE_OUT_OF_RANGE');
  const tenant=await database().prepare("SELECT id FROM tenants WHERE slug=? AND activity_id='restaurants' AND status='active' LIMIT 1").bind(input.slug).first<{id:string}>();
  if(!tenant)throw new ApiError(404,'NOT_FOUND');
  const typeSetting=await database().prepare("SELECT enabled FROM restaurant_order_type_settings WHERE tenant_id=? AND order_type='reservation' LIMIT 1").bind(tenant.id).first<{enabled:number|string}>().catch(()=>null);
  if(typeSetting&&!Number(typeSetting.enabled))throw new ApiError(403,'RESERVATIONS_DISABLED');
  await requireTenantFeature(tenant.id,'reservations');
  const branch=await database().prepare('SELECT id FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,id ASC LIMIT 1').bind(tenant.id).first<{id:string}>();
  if(!branch)throw new ApiError(409,'BRANCH_REQUIRED');
  const duplicate=await database().prepare("SELECT id FROM restaurant_reservations WHERE tenant_id=? AND customer_phone=? AND reservation_at BETWEEN ? AND ? AND status IN ('pending','confirmed','seated') LIMIT 1").bind(tenant.id,input.customerPhone,input.reservationAt-15*60000,input.reservationAt+15*60000).first();
  if(duplicate)throw new ApiError(409,'DUPLICATE_RESERVATION');
  const id=crypto.randomUUID();
  const reference='FR-'+Date.now().toString(36).toUpperCase()+'-'+id.slice(0,6).toUpperCase();
  await database().prepare("INSERT INTO restaurant_reservations(id,tenant_id,branch_id,table_id,reference,status,customer_name,customer_email,customer_phone,guests,reservation_at,notes,created_at,updated_at) VALUES(?,?,?,NULL,?,'pending',?,?,?,?,?,?,?,?)").bind(id,tenant.id,branch.id,reference,input.customerName,input.customerEmail||null,input.customerPhone,input.guests,input.reservationAt,input.notes||null,now,now).run();
  return Response.json({id,reference,status:'pending'},{status:201});
 }catch(error){return fail(error)}
}

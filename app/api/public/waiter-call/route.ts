import { z } from 'zod';
import { database } from '@/db';

export const dynamic='force-dynamic';
const schema=z.object({slug:z.string().regex(/^[a-z0-9][a-z0-9-]{1,59}$/),tableReference:z.string().trim().min(1).max(80)});

export async function POST(request:Request){
 try{
  const v=schema.parse(await request.json());
  const tenant=await database().prepare("SELECT id,waiter_call_enabled FROM tenants WHERE slug=? AND activity_id='restaurants' AND status='active' LIMIT 1").bind(v.slug).first<{id:string;waiter_call_enabled:number|string}>();
  if(!tenant)return Response.json({error:'RESTAURANT_NOT_FOUND'},{status:404});
  if(!Number(tenant.waiter_call_enabled))return Response.json({error:'WAITER_CALL_DISABLED'},{status:403});
  const recent=await database().prepare("SELECT id FROM restaurant_waiter_calls WHERE tenant_id=? AND table_reference=? AND status IN ('new','acknowledged') AND created_at>? LIMIT 1").bind(tenant.id,v.tableReference,Date.now()-20*60*1000).first();
  if(recent)return Response.json({error:'WAITER_CALL_ALREADY_ACTIVE'},{status:409});
  await database().prepare("INSERT INTO restaurant_waiter_calls(id,tenant_id,table_reference,status,source,created_at) VALUES(?,?,?,'new','menu',?)").bind(crypto.randomUUID(),tenant.id,v.tableReference,Date.now()).run();
  return Response.json({ok:true});
 }catch(e){return Response.json({error:e instanceof z.ZodError?'INVALID_WAITER_CALL':'WAITER_CALL_FAILED'},{status:400})}
}

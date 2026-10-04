import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
import {getCurrentUser} from '@/app/session';
import {activities} from '@/lib/platform/activities';
export const dynamic='force-dynamic';
const schema=z.object({storeName:z.string().trim().min(2).max(120),slug:z.string().regex(/^[a-z][a-z0-9-]{2,59}$/),activityId:z.enum(activities.map(a=>a.id) as [string,...string[]]),countryCode:z.string().regex(/^[A-Z]{2}$/),currency:z.string().regex(/^[A-Z]{3}$/),phone:z.string().trim().min(7).max(32),city:z.string().trim().min(2).max(120),planId:z.string().regex(/^[a-z0-9-]{2,40}$/)});
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:'SIGN_IN_REQUIRED'},{status:401});
  const raw=await request.text();if(raw.length>6000)throw new ApiError(413,'INPUT_TOO_LARGE');
  let parsed:unknown;try{parsed=JSON.parse(raw)}catch{return NextResponse.json({error:'INVALID_INPUT',field:'request'},{status:400})}
  const checked=schema.safeParse(parsed);if(!checked.success)return NextResponse.json({error:'INVALID_INPUT',field:String(checked.error.issues[0]?.path[0]??'request')},{status:400});
  const v=checked.data,db=database();
  const tables=['tenants','memberships','tenant_profiles','subscriptions','branches','package_plans'];
  for(const table of tables){try{await db.prepare('SELECT 1 FROM `'+table+'` LIMIT 1').first()}catch(error){const message=error instanceof Error?error.message:'';if(/doesn't exist|no such table|ER_NO_SUCH_TABLE/i.test(message))return NextResponse.json({error:'SCHEMA_MISSING',table},{status:503});throw error}}
  const existing=await db.prepare('SELECT tenant_id FROM memberships WHERE user_id=? LIMIT 1').bind(user.userId).first();
  if(existing)return NextResponse.json({error:'ALREADY_ONBOARDED'},{status:409});
  const plan=await db.prepare('SELECT id,monthly_price FROM package_plans WHERE id=? AND enabled=1').bind(v.planId).first<{id:string;monthly_price:number}>();
  if(!plan)return NextResponse.json({error:'PLAN_UNAVAILABLE'},{status:400});
  if(await db.prepare('SELECT id FROM tenants WHERE slug=?').bind(v.slug).first())return NextResponse.json({error:'SLUG_EXISTS'},{status:409});
  const tenantId=randomUUID(),branchId=randomUUID(),now=Date.now(),isPaid=Number(plan.monthly_price)>0,restaurant=v.activityId==='restaurants';
  await db.batch([
   db.prepare('INSERT INTO tenants(id,name,slug,activity_id,country_code,currency,status,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(tenantId,v.storeName,v.slug,v.activityId,v.countryCode,v.currency,(isPaid||!restaurant)?'draft':'active',user.userId,now),
   db.prepare("INSERT INTO memberships(user_id,tenant_id,role) VALUES(?,?, 'owner')").bind(user.userId,tenantId),
   db.prepare('INSERT INTO tenant_profiles(tenant_id,phone,city,updated_at) VALUES(?,?,?,?)').bind(tenantId,v.phone,v.city,now),
   db.prepare("INSERT INTO subscriptions(id,tenant_id,plan_id,status,starts_at,expires_at,created_at,updated_at) VALUES(?,?,?, ?,NULL,NULL,?,?)").bind(randomUUID(),tenantId,v.planId,isPaid?'pending':'active',now,now),
   db.prepare('INSERT INTO branches(id,tenant_id,name,is_primary) VALUES(?,?,?,1)').bind(branchId,tenantId,v.storeName)
  ]);
  const next=isPaid?'/store/subscription?tenant='+tenantId:(restaurant?'/restaurant?tenant='+tenantId:'/store?tenant='+tenantId);
  return NextResponse.json({next,tenantId},{status:201});
 }catch(error){
  if(error instanceof ApiError)return NextResponse.json({error:error.code},{status:error.status});
  console.error('Business onboarding failed',error instanceof Error?error.name:'Unknown');
  return NextResponse.json({error:'ONBOARDING_UNAVAILABLE'},{status:503});
 }
}
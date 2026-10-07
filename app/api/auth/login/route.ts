import {randomBytes,createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
import {verifyPassword,hashPassword} from '@/lib/platform/password.mjs';
import {safeReturnPath} from '@/app/session';
export const dynamic='force-dynamic';
let dummy:Promise<string>|undefined;
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const raw=await request.text();if(raw.length>4096)return NextResponse.json({error:'INVALID_INPUT'},{status:400});
  const input=JSON.parse(raw);const email=String(input.email??'').trim().toLowerCase();const password=String(input.password??'');
  if(!email||email.length>254||password.length>256)return NextResponse.json({error:'INVALID_CREDENTIALS'},{status:401});
  const bucket=Math.floor(Date.now()/900000);const rateKey=createHash('sha256').update(email+':'+bucket).digest('hex');
  await database().prepare('INSERT INTO auth_login_attempts(bucket_key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET attempts=attempts+1').bind(rateKey,Date.now()+1800000).run();
  const attempts=await database().prepare('SELECT attempts FROM auth_login_attempts WHERE bucket_key=?').bind(rateKey).first<{attempts:number}>();
  if((attempts?.attempts??0)>10)return NextResponse.json({error:'TOO_MANY_ATTEMPTS'},{status:429});
  const user=await database().prepare('SELECT id,email,password_hash FROM users WHERE email=?').bind(email).first<{id:string;email:string;password_hash:string|null}>();
  dummy??=hashPassword(randomBytes(32).toString('hex'));
  const valid=await verifyPassword(password,user?.password_hash??await dummy);
  if(!valid||!user)return NextResponse.json({error:'INVALID_CREDENTIALS'},{status:401});
  const token=randomBytes(32).toString('hex');const now=Date.now();
  await database().prepare('INSERT INTO auth_sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').bind(createHash('sha256').update(token).digest('hex'),user.id,now+7*86400000,now).run();
  await database().prepare('DELETE FROM auth_sessions WHERE expires_at<?').bind(now).run();
  await database().prepare('DELETE FROM auth_login_attempts WHERE expires_at<?').bind(now).run();
  const admin=Boolean(process.env.PLATFORM_ADMIN_EMAIL)&&user.email.toLowerCase()===process.env.PLATFORM_ADMIN_EMAIL!.toLowerCase();
  let next=safeReturnPath(String(input.next??''));
  if(admin){if(next==='/')next='/admin';}
  else{
   const workspace=await database().prepare('SELECT t.id,t.activity_id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? ORDER BY t.created_at ASC LIMIT 1').bind(user.id).first<{id:string;activity_id:string}>();
   if(!workspace)next='/onboarding';
   else if(next==='/'||next==='/admin'||next==='/onboarding')next=workspace.activity_id==='restaurants'?'/restaurant?tenant='+workspace.id:'/store?tenant='+workspace.id;
  }
  const response=NextResponse.json({next});response.cookies.set('foon_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production'&&process.env.SITE_ORIGIN?.startsWith('https://'),sameSite:'lax',path:'/',maxAge:7*86400});return response;
 }catch(e){
  if(e instanceof ApiError)return NextResponse.json({error:e.code},{status:e.status});
  const err=e as {code?:string;message?:string};
  const trace=crypto.randomUUID().slice(0,8).toUpperCase();
  console.error('[auth:login]',{trace,code:err?.code,message:err?.message});
  const databaseCodes=new Set(['DATABASE_BUSY','POOL_ENQUEUELIMIT','ETIMEDOUT','ECONNREFUSED','PROTOCOL_CONNECTION_LOST','ER_ACCESS_DENIED_ERROR','ER_BAD_DB_ERROR','ER_NO_SUCH_TABLE']);
  const error=databaseCodes.has(String(err?.code))?'DATABASE_UNAVAILABLE':'SIGN_IN_UNAVAILABLE';
  return NextResponse.json({error,trace},{status:503});
 }
}

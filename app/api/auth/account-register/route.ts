import {randomBytes,createHash,randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
import {hashPassword} from '@/lib/platform/password.mjs';
export const dynamic='force-dynamic';
const schema=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().toLowerCase().email().max(254),password:z.string().min(9).max(128),terms:z.literal(true)});
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const raw=await request.text();if(raw.length>4000)throw new ApiError(413,'INPUT_TOO_LARGE');
  let parsed:unknown;try{parsed=JSON.parse(raw)}catch{return NextResponse.json({error:'INVALID_INPUT'},{status:400})}
  const checked=schema.safeParse(parsed);if(!checked.success)return NextResponse.json({error:'INVALID_INPUT',field:String(checked.error.issues[0]?.path[0]??'request')},{status:400});
  const v=checked.data,db=database();
  const existing=await db.prepare('SELECT id FROM users WHERE email=?').bind(v.email).first();
  if(existing)return NextResponse.json({error:'EMAIL_EXISTS'},{status:409});
  const userId=randomUUID(),token=randomBytes(32).toString('hex'),now=Date.now();
  await db.batch([
   db.prepare('INSERT INTO users(id,email,display_name,password_hash,platform_role,created_at) VALUES(?,?,?,?,?,?)').bind(userId,v.email,v.name,await hashPassword(v.password),'viewer',now),
   db.prepare('INSERT INTO auth_sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').bind(createHash('sha256').update(token).digest('hex'),userId,now+7*86400000,now)
  ]);
  const response=NextResponse.json({next:'/onboarding'},{status:201});
  response.cookies.set('foon_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production'&&process.env.SITE_ORIGIN?.startsWith('https://'),sameSite:'lax',path:'/',maxAge:7*86400});
  return response;
 }catch(e){
  if(e instanceof ApiError)return NextResponse.json({error:e.code},{status:e.status});
  console.error('Account registration failed',e instanceof Error?e.name:'Unknown');
  return NextResponse.json({error:'REGISTRATION_UNAVAILABLE'},{status:503});
 }
}
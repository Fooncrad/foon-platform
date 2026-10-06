import {createHash,randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
import {sendPasswordResetMessage} from '@/lib/platform/delivery';
export const dynamic='force-dynamic';
const bodySchema=z.object({email:z.string().trim().toLowerCase().email().max(254),locale:z.enum(['ar','en','fr']).default('ar')});
const generic={message:'If an account matches this email, a password reset link will be sent.'};
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const raw=await request.text();if(raw.length>2048)throw new ApiError(400,'INVALID_INPUT');
  let payload:unknown;try{payload=JSON.parse(raw)}catch{throw new ApiError(400,'INVALID_INPUT')}
  const input=bodySchema.parse(payload),now=Date.now(),bucket=Math.floor(now/900000);
  const rateKey=createHash('sha256').update(input.email+':'+bucket).digest('hex');
  await database().prepare("INSERT INTO auth_password_reset_attempts(bucket_key,attempts,expires_at) VALUES(?,1,?) ON DUPLICATE KEY UPDATE attempts=attempts+1,expires_at=VALUES(expires_at)").bind(rateKey,now+1800000).run();
  const attempts=await database().prepare('SELECT attempts FROM auth_password_reset_attempts WHERE bucket_key=?').bind(rateKey).first<{attempts:number}>();
  if((attempts?.attempts??0)>5)return NextResponse.json(generic,{status:202});
  await database().prepare('DELETE FROM auth_password_reset_attempts WHERE expires_at<?').bind(now).run();
  await database().prepare('DELETE FROM password_reset_tokens WHERE expires_at<=?').bind(now).run();
  const user=await database().prepare('SELECT id,email,display_name FROM users WHERE email=?').bind(input.email).first<{id:string;email:string;display_name:string}>();
  if(!user)return NextResponse.json(generic,{status:202});
  await database().prepare('DELETE FROM password_reset_tokens WHERE user_id=? AND (used_at IS NULL OR expires_at<=?)').bind(user.id,now).run();
  const token=randomBytes(32).toString('hex'),tokenHash=createHash('sha256').update(token).digest('hex'),expiresAt=now+30*60*1000;
  await database().prepare('INSERT INTO password_reset_tokens(token_hash,user_id,expires_at,used_at,created_at) VALUES(?,?,?,NULL,?)').bind(tokenHash,user.id,expiresAt,now).run();
  try{
   const origin=process.env.SITE_ORIGIN;if(!origin)throw new ApiError(503,'SITE_ORIGIN_REQUIRED');
   const base=new URL(origin);if(process.env.NODE_ENV==='production'&&base.protocol!=='https:')throw new ApiError(503,'HTTPS_REQUIRED');
   const resetUrl=new URL('/reset-password',base);resetUrl.searchParams.set('token',token);
   await sendPasswordResetMessage({locale:input.locale,recipient:user.email,variables:{customer_name:user.display_name,store_name:'FOON',service_number:'',service_type:'',amount:'',currency:'',date:'',plan_name:'',expires_at:'',reset_url:resetUrl.toString()},idempotencyKey:tokenHash});
  }catch(error){
   await database().prepare('UPDATE password_reset_tokens SET used_at=? WHERE token_hash=?').bind(Date.now(),tokenHash).run();
   console.warn('Password reset email delivery failed:',error instanceof ApiError?error.code:'EMAIL_STATUS_UNKNOWN');
  }
  return NextResponse.json(generic,{status:202});
 }catch(error){
  if(error instanceof ApiError)return NextResponse.json({error:error.code},{status:error.status});
  if(error instanceof z.ZodError)return NextResponse.json({error:'INVALID_INPUT'},{status:400});
  return NextResponse.json({error:'RESET_REQUEST_UNAVAILABLE'},{status:503});
 }
}

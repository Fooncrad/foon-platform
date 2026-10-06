import {createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
import {hashPassword} from '@/lib/platform/password.mjs';
export const dynamic='force-dynamic';
const schema=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),password:z.string().min(9).max(128)});
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const raw=await request.text();if(raw.length>4096)throw new ApiError(400,'INVALID_INPUT');
  let payload:unknown;try{payload=JSON.parse(raw)}catch{throw new ApiError(400,'INVALID_INPUT')}
  const {token,password}=schema.parse(payload),now=Date.now(),tokenHash=createHash('sha256').update(token).digest('hex'),passwordHash=await hashPassword(password);
  await database().transaction(async tx=>{
   const claim=await tx.prepare('UPDATE password_reset_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(now,tokenHash,now).run();
   if(claim.meta.changes!==1)throw new ApiError(400,'RESET_LINK_INVALID');
   const row=await tx.prepare('SELECT user_id FROM password_reset_tokens WHERE token_hash=?').bind(tokenHash).first<{user_id:string}>();
   if(!row)throw new ApiError(400,'RESET_LINK_INVALID');
   const updated=await tx.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(passwordHash,row.user_id).run();
   if(updated.meta.changes<1)throw new ApiError(400,'RESET_LINK_INVALID');
   await tx.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(row.user_id).run();
  });
  return NextResponse.json({reset:true});
 }catch(error){
  if(error instanceof ApiError)return NextResponse.json({error:error.code},{status:error.status});
  if(error instanceof z.ZodError)return NextResponse.json({error:'INVALID_INPUT'},{status:400});
  return NextResponse.json({error:'PASSWORD_RESET_UNAVAILABLE'},{status:503});
 }
}

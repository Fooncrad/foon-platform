import {cookies} from 'next/headers';
import {createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {database} from '@/db';
import {ApiError,sameOrigin} from '@/lib/platform/security';
export async function POST(request:Request){try{sameOrigin(request);const token=(await cookies()).get('foon_session')?.value;if(token)await database().prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(createHash('sha256').update(token).digest('hex')).run();const response=NextResponse.json({ok:true});response.cookies.set('foon_session','',{httpOnly:true,sameSite:'lax',secure:process.env.SITE_ORIGIN?.startsWith('https://'),path:'/',maxAge:0});return response;}catch(e){return e instanceof ApiError?NextResponse.json({error:e.code},{status:e.status}):NextResponse.json({error:'SIGN_OUT_UNAVAILABLE'},{status:503});}}

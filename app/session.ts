import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {createHash} from 'node:crypto';
import {database} from '@/db';
export type SessionUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getCurrentUser():Promise<SessionUser|null>{
 const token=(await cookies()).get('foon_session')?.value;
 if(!token||! /^[a-f0-9]{64}$/.test(token))return null;
 const hash=createHash('sha256').update(token).digest('hex');
 const row=await database().prepare('SELECT u.id,u.email,u.display_name FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(hash,Date.now()).first<{id:string;email:string;display_name:string}>();
 return row?{userId:row.id,email:row.email,displayName:row.display_name,fullName:row.display_name}:null;
}
export async function requireUser(returnTo:string){const u=await getCurrentUser();if(u)return u;redirect(signInPath(returnTo));}
export function safeReturnPath(value:string){if(!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/';try{const u=new URL(value,'https://app.local');return u.origin==='https://app.local'&&!['/login','/logout'].includes(u.pathname)?u.pathname+u.search:'/';}catch{return '/';}}
export function signInPath(returnTo:string){return '/login?next='+encodeURIComponent(safeReturnPath(returnTo));}
export function signOutPath(returnTo='/'){return '/logout?next='+encodeURIComponent(safeReturnPath(returnTo));}

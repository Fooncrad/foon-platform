import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
export const dynamic='force-dynamic';
export default async function Restaurant({searchParams}:{searchParams:Promise<{tenant?:string}>}){
 const user=await requireUser('/restaurant'),params=await searchParams;
 const admin=Boolean(process.env.PLATFORM_ADMIN_EMAIL)&&user.email.toLowerCase()===process.env.PLATFORM_ADMIN_EMAIL!.toLowerCase();
 if(admin){
  const selected=params.tenant?await database().prepare("SELECT id,slug FROM tenants WHERE id=? AND activity_id='restaurants'").bind(params.tenant).first<{id:string;slug:string}>():await database().prepare("SELECT id,slug FROM tenants WHERE activity_id='restaurants' ORDER BY created_at ASC LIMIT 1").first<{id:string;slug:string}>();
  if(!selected)redirect('/admin');
  redirect('/restaurant/'+encodeURIComponent(selected.slug));
 }
 const memberships=await database().prepare("SELECT t.id,t.slug FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.activity_id='restaurants' ORDER BY t.created_at ASC").bind(user.userId).all<{id:string;slug:string}>();
 if(!memberships.results.length)redirect('/onboarding');
 const selected=params.tenant?memberships.results.find(x=>x.id===params.tenant):memberships.results[0];
 redirect('/restaurant/'+encodeURIComponent((selected??memberships.results[0]).slug));
}
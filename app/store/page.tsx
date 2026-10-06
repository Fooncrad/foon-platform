import {Suspense} from 'react';
import {redirect,notFound} from 'next/navigation';
import {requireUser} from '@/app/session';
import {database} from '@/db';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
export const dynamic='force-dynamic';
export default async function Store({searchParams}:{searchParams:Promise<{tenant?:string}>}){
 const user=await requireUser('/store');const params=await searchParams;
 const admin=Boolean(process.env.PLATFORM_ADMIN_EMAIL)&&user.email.toLowerCase()===process.env.PLATFORM_ADMIN_EMAIL!.toLowerCase();
 if(admin){
  if(!params.tenant)redirect('/admin');
  const tenant=await database().prepare('SELECT id,activity_id FROM tenants WHERE id=?').bind(params.tenant).first<{id:string;activity_id:string}>();
  if(!tenant)notFound();
  if(tenant.activity_id==='restaurants')redirect('/restaurant?tenant='+tenant.id);
  return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>;
 }
 const restaurant=await database().prepare("SELECT t.id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND m.role IN ('owner','manager') AND t.activity_id='restaurants' ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{id:string}>();
 const memberships=await database().prepare("SELECT t.id,t.status FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND m.role IN ('owner','manager') AND t.activity_id<>'restaurants' ORDER BY t.created_at ASC").bind(user.userId).all<{id:string;status:string}>();
 if(!memberships.results.length){if(restaurant)redirect('/restaurant?tenant='+restaurant.id);redirect('/onboarding')}
 if(params.tenant&&!memberships.results.some(x=>x.id===params.tenant))redirect('/store?tenant='+memberships.results[0].id);
 return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>
}
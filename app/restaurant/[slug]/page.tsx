import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import ControlPanel from '@/components/platform/control-panel';
import Surface from '@/components/platform/surface';

export default async function RestaurantWorkspace({params}:{params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');
 const {slug}=await params;
 const membership=await database().prepare("SELECT t.id,t.slug,t.status FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{id:string;slug:string;status:string}>();
 if(!membership){
  const fallback=await database().prepare("SELECT t.slug FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.activity_id='restaurants' ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{slug:string}>();
  if(!fallback)redirect('/register/restaurant');
  redirect('/restaurant/'+encodeURIComponent(fallback.slug));
 }
 return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>
}

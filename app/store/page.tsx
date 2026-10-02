import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {requireUser} from '@/app/session';
import {database} from '@/db';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
export const dynamic='force-dynamic';
export default async function Store({searchParams}:{searchParams:Promise<{tenant?:string}>}){
 const user=await requireUser('/store');const params=await searchParams;
 const restaurant=await database().prepare("SELECT t.id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND m.role IN ('owner','manager') AND t.activity_id='restaurants' ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{id:string}>();
 const memberships=await database().prepare("SELECT t.id,t.status FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND m.role IN ('owner','manager') AND t.activity_id<>'restaurants' ORDER BY t.created_at ASC").bind(user.userId).all<{id:string;status:string}>();
 if(!memberships.results.length){if(restaurant)redirect('/restaurant?tenant='+restaurant.id);redirect('/register/store')}
 if(params.tenant&&!memberships.results.some(x=>x.id===params.tenant))redirect('/store?tenant='+memberships.results[0].id);
 return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>
}

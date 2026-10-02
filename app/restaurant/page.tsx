import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/lib/auth';
import ControlPanel from '@/components/platform/control-panel';

export default async function Restaurant({searchParams}:{searchParams:Promise<{tenant?:string}>}){
 const user=await requireUser('/restaurant');
 const params=await searchParams;
 const memberships=await database().prepare("SELECT t.id,t.status,t.activity_id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.activity_id='restaurants'").bind(user.userId).all<{id:string;status:string;activity_id:string}>();
 if(!memberships.results.length)redirect('/register/restaurant');
 if(params.tenant&&!memberships.results.some(x=>x.id===params.tenant))redirect('/restaurant?tenant='+memberships.results[0].id);
 if(!params.tenant)redirect('/restaurant?tenant='+memberships.results[0].id);
 return <Suspense><ControlPanel storeMode/></Suspense>
}

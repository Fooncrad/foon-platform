import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';

export default async function Restaurant({searchParams}:{searchParams:Promise<{tenant?:string}>}){
 const user=await requireUser('/restaurant');
 const params=await searchParams;
 const memberships=await database().prepare("SELECT t.id,t.slug FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.activity_id='restaurants' ORDER BY t.created_at ASC").bind(user.userId).all<{id:string;slug:string}>();
 if(!memberships.results.length)redirect('/register/restaurant');
 const selected=params.tenant?memberships.results.find(x=>x.id===params.tenant):memberships.results[0];
 redirect('/restaurant/'+encodeURIComponent((selected??memberships.results[0]).slug));
}

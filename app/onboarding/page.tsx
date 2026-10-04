import {redirect} from 'next/navigation';
import {requireUser} from '@/app/session';
import {database} from '@/db';
import Surface from '@/components/platform/surface';
import BusinessOnboarding from '@/components/platform/business-onboarding';
export const dynamic='force-dynamic';
export default async function Onboarding(){
 const user=await requireUser('/onboarding');
 const membership=await database().prepare("SELECT t.id,t.activity_id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{id:string;activity_id:string}>();
 if(membership)redirect(membership.activity_id==='restaurants'?'/restaurant?tenant='+membership.id:'/store?tenant='+membership.id);
 return <Surface page="admin" content={<BusinessOnboarding/>}/>;
}
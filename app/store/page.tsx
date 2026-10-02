import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {requireUser} from '@/app/session';
import {database} from '@/db';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
export const dynamic='force-dynamic';
export default async function Store(){const user=await requireUser('/store');const membership=await database().prepare("SELECT t.id,t.status FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND m.role IN ('owner','manager') ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{id:string;status:string}>();if(!membership)redirect('/register/store');return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>}

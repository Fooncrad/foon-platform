import {Suspense} from 'react';
const env=process.env;
import {requireUser} from '@/app/session';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
import AccessDenied from '@/components/platform/access-denied';
export const dynamic='force-dynamic';
export default async function Admin(){const user=await requireUser('/admin');const admin=Boolean(env.PLATFORM_ADMIN_EMAIL)&&user.email.toLowerCase()===env.PLATFORM_ADMIN_EMAIL!.toLowerCase();return <Suspense>{admin?<ControlPanel/>:<Surface page="admin" content={<AccessDenied/>}/>}</Suspense>}

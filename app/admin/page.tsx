import {Suspense} from 'react';
import {env} from 'cloudflare:workers';
import {requireChatGPTUser} from '@/app/chatgpt-auth';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
import AccessDenied from '@/components/platform/access-denied';
export const dynamic='force-dynamic';
export default async function Admin(){const user=await requireChatGPTUser('/admin');const admin=Boolean(env.PLATFORM_ADMIN_EMAIL)&&user.email.toLowerCase()===env.PLATFORM_ADMIN_EMAIL!.toLowerCase();return <Suspense><Surface page="admin" content={admin?<ControlPanel/>:<AccessDenied/>}/></Suspense>}

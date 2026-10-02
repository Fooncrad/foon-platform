import {Suspense} from 'react';
import {requireChatGPTUser} from '@/app/chatgpt-auth';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
export const dynamic='force-dynamic';
export default async function Store(){await requireChatGPTUser('/store');return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>}

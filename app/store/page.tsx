import {Suspense} from 'react';
import {requireUser} from '@/app/session';
import Surface from '@/components/platform/surface';
import ControlPanel from '@/components/platform/control-panel';
export const dynamic='force-dynamic';
export default async function Store(){await requireUser('/store');return <Suspense><Surface page="admin" content={<ControlPanel storeMode/>}/></Suspense>}

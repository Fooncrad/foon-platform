import {Suspense} from 'react';
import Surface from '@/components/platform/surface';
import StoreRegistration from '@/components/platform/store-registration';
export default function StoreRegister(){return <Suspense><Surface page="admin" content={<StoreRegistration/>}/></Suspense>}

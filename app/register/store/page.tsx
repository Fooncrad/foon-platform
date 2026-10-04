import {Suspense} from 'react';
import Surface from '@/components/platform/surface';
import AccountRegistration from '@/components/platform/account-registration';
export default function StoreRegister(){return <Suspense><Surface page="admin" content={<AccountRegistration/>}/></Suspense>}

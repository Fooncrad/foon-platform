import {Suspense} from 'react';
import Surface from '@/components/platform/surface';
import LoginForm from '@/components/platform/login-form';
export default function Login(){return <Suspense><Surface page="admin" content={<LoginForm/>}/></Suspense>}

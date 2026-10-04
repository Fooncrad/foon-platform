'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, RotateCcw } from 'lucide-react';
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 const pathname=usePathname(),[incidentId]=useState(()=>crypto.randomUUID().slice(0,8).toUpperCase());
 useEffect(()=>{console.error('[FOON '+incidentId+'] '+pathname,error)},[error,incidentId,pathname]);
 return <main className="foon-error-page" dir="rtl"><section role="alert"><AlertTriangle/><p>تعذر عرض هذه الصفحة</p><h1>حدث خطأ غير متوقع</h1><dl><div><dt>المشكلة</dt><dd>CLIENT_RENDER_ERROR</dd></div><div><dt>الموقع</dt><dd dir="ltr">{pathname}</dd></div><div><dt>رمز التتبع</dt><dd dir="ltr">{incidentId}</dd></div></dl><button type="button" onClick={reset}><RotateCcw size={17}/> إعادة المحاولة</button></section></main>
}

'use client';
import { useEffect,useState } from 'react';
import { AlertTriangle,RotateCcw } from 'lucide-react';
import './globals.css';import './premium.css';
export default function GlobalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 const [incidentId]=useState(()=>crypto.randomUUID().slice(0,8).toUpperCase());
 useEffect(()=>{console.error('[FOON '+incidentId+'] root render',error)},[error,incidentId]);
 return <html lang="ar" dir="rtl"><body><main className="foon-error-page"><section role="alert"><AlertTriangle/><p>تعذر تحميل النظام</p><h1>حدث خطأ غير متوقع</h1><dl><div><dt>المشكلة</dt><dd>ROOT_RENDER_ERROR</dd></div><div><dt>الموقع</dt><dd dir="ltr">/</dd></div><div><dt>رمز التتبع</dt><dd dir="ltr">{incidentId}</dd></div></dl><button type="button" onClick={reset}><RotateCcw size={17}/> إعادة المحاولة</button></section></main></body></html>
}

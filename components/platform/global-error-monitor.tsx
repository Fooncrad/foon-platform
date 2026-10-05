'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Copy, X } from 'lucide-react';
import { usePreferences } from '@/components/platform/preferences';

type Diagnostic = { incidentId: string; code: string; location: string; status?: number; message?: string; kind?: 'error'|'success' };
const eventName='foon:diagnostic-error',successEvent='foon:operation-success';
const reasons:Record<string,[string,string,string]>={
 INVALID_INPUT:['البيانات المدخلة غير صحيحة أو ناقصة.','The submitted data is invalid or incomplete.','Les données sont invalides ou incomplètes.'],
 FORBIDDEN:['لا تملك صلاحية تنفيذ هذه العملية.','You do not have permission to perform this action.','Vous n’avez pas l’autorisation d’effectuer cette action.'],
 UNAUTHORIZED:['انتهت الجلسة أو يلزم تسجيل الدخول.','Your session expired or sign-in is required.','Votre session a expiré ou une connexion est requise.'],
 NOT_FOUND:['العنصر المطلوب غير موجود أو لم يعد متاحًا.','The requested item was not found or is no longer available.','L’élément demandé est introuvable.'],
 INVALID_STATUS_TRANSITION:['لا يمكن تنفيذ الإجراء من الحالة الحالية. حدّث البيانات وحاول مجددًا.','This action is not allowed from the current status. Refresh and try again.','Cette action n’est pas autorisée depuis le statut actuel.'],
 PLAN_FEATURE_REQUIRED:['هذه الخدمة غير مفعلة ضمن الباقة الحالية.','This service is not enabled in the current plan.','Ce service n’est pas activé dans le forfait actuel.'],
 ACTIVE_WAITLIST_EXISTS:['يوجد انتظار نشط لهذا العميل ولا يمكن إنشاء طلب انتظار أو حجز آخر.','This customer already has an active waitlist entry.','Ce client a déjà une attente active.'],
 ACTIVE_RESERVATION_EXISTS:['يوجد حجز نشط لهذا العميل.','This customer already has an active reservation.','Ce client a déjà une réservation active.'],
 TABLE_RESERVATION_CONFLICT:['الطاولة محجوزة في هذا الوقت. اختر طاولة أو موعدًا آخر.','This table is already reserved at that time.','Cette table est déjà réservée à cette heure.'],
 TABLE_CAPACITY_TOO_SMALL:['سعة الطاولة أقل من عدد الضيوف.','The table capacity is smaller than the party size.','La capacité de la table est insuffisante.'],
 RESERVATION_SLOT_UNAVAILABLE:['الوقت المختار غير متاح للحجز.','The selected reservation time is unavailable.','L’heure sélectionnée n’est pas disponible.'],
 RESERVATION_DATE_OUT_OF_RANGE:['تاريخ الحجز خارج المدة المسموحة.','The reservation date is outside the allowed range.','La date est hors de la période autorisée.'],
 DATABASE_SCHEMA_MISSING:['قاعدة البيانات غير مكتملة وتحتاج تحديثًا تشغيليًا.','The database schema is incomplete and requires an operational update.','Le schéma de base de données est incomplet.'],
 DATABASE_COLUMN_MISSING:['قاعدة البيانات غير محدثة: حقل تشغيلي مطلوب غير موجود.','The database is outdated: a required field is missing.','La base de données n’est pas à jour.'],
 DATABASE_CONSTRAINT:['تعذر التنفيذ بسبب تعارض في ترابط البيانات.','The operation conflicts with existing data.','L’opération est en conflit avec les données existantes.'],
 DATABASE_ACCESS_DENIED:['تعذر الوصول إلى قاعدة البيانات بسبب صلاحيات الاتصال.','Database access was denied.','Accès à la base de données refusé.'],
 DATABASE_TIMEOUT:['انتهت مهلة استجابة قاعدة البيانات. حاول مرة أخرى.','The database timed out. Try again.','La base de données a expiré. Réessayez.'],
 DATABASE_CONNECTION:['تعذر الاتصال بقاعدة البيانات.','Could not connect to the database.','Connexion à la base impossible.'],
 SERVICE_UNAVAILABLE:['حدث خطأ تقني في الخدمة. لم يتم تأكيد تنفيذ العملية.','A technical service error occurred. The operation was not confirmed.','Une erreur technique est survenue. L’opération n’a pas été confirmée.']
};
export function notifyOperationSuccess(message:string){window.dispatchEvent(new CustomEvent(successEvent,{detail:{message,kind:'success'}}))}
export function GlobalErrorMonitor(){const pathname=usePathname(),{locale}=usePreferences(),[diagnostic,setDiagnostic]=useState<Diagnostic|null>(null),[success,setSuccess]=useState('');const lang=locale==='ar'?0:locale==='fr'?2:1;
 useEffect(()=>{const onDiagnostic=(event:Event)=>setDiagnostic((event as CustomEvent<Diagnostic>).detail),onSuccess=(event:Event)=>{setSuccess((event as CustomEvent<{message:string}>).detail.message);window.setTimeout(()=>setSuccess(''),3500)},originalFetch=window.fetch.bind(window);
 const onError=(event:ErrorEvent)=>{const incidentId=crypto.randomUUID().slice(0,8).toUpperCase();console.error('[FOON '+incidentId+'] '+pathname,event.error||event.message);window.dispatchEvent(new CustomEvent(eventName,{detail:{incidentId,code:'CLIENT_RUNTIME_ERROR',location:pathname,status:0}}))};
 const onRejection=(event:PromiseRejectionEvent)=>onError({error:event.reason,message:String(event.reason)} as ErrorEvent);
 window.fetch=async(...args:Parameters<typeof fetch>)=>{const response=await originalFetch(...args),input=args[0],url=typeof input==='string'?input:input instanceof URL?input.toString():input.url;if(url.startsWith('/api/')&&!response.ok){const body=await response.clone().json().catch(()=>({})) as {error?:string;incidentId?:string;location?:string};const detail={incidentId:body.incidentId||crypto.randomUUID().slice(0,8).toUpperCase(),code:body.error||'HTTP_'+response.status,location:body.location||new URL(url,location.origin).pathname,status:response.status};console.error('[FOON '+detail.incidentId+'] '+detail.location+' '+detail.code+' ('+response.status+')');window.dispatchEvent(new CustomEvent(eventName,{detail}))}return response};
 window.addEventListener(eventName,onDiagnostic);window.addEventListener(successEvent,onSuccess);window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onRejection);return()=>{window.fetch=originalFetch;window.removeEventListener(eventName,onDiagnostic);window.removeEventListener(successEvent,onSuccess);window.removeEventListener('error',onError);window.removeEventListener('unhandledrejection',onRejection)}},[pathname]);
 const reason=diagnostic?(reasons[diagnostic.code]?.[lang]||(locale==='ar'?'تعذر تنفيذ العملية.':locale==='fr'?'Impossible d’effectuer l’opération.':'The operation could not be completed.')):'';
 return <>{success&&<aside className="foon-operation-success" role="status" aria-live="polite"><CheckCircle2 size={18}/><span>{success}</span></aside>}{diagnostic&&<aside className="foon-diagnostic" role="alert" aria-live="assertive" dir={locale==='ar'?'rtl':'ltr'}><AlertTriangle size={19}/><div className="foon-diagnostic-copy"><strong>{locale==='ar'?'تعذر تنفيذ العملية':locale==='fr'?'Opération refusée':'Operation failed'}</strong><span>{reason}</span><span>{locale==='ar'?'رمز الحالة':locale==='fr'?'Statut':'Status'}: {diagnostic.status||'CLIENT'} · {diagnostic.code}</span><span>{locale==='ar'?'رقم التتبع':locale==='fr'?'Suivi':'Tracking'}: {diagnostic.incidentId}</span><span>{diagnostic.location}</span></div><button type="button" aria-label="Copy" onClick={()=>void navigator.clipboard?.writeText(`${diagnostic.status||'CLIENT'} · ${diagnostic.code} · ${diagnostic.incidentId} · ${diagnostic.location}`)}><Copy size={16}/></button><button type="button" aria-label="Close" onClick={()=>setDiagnostic(null)}><X size={18}/></button></aside>}</>}
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Copy, X } from 'lucide-react';

type Diagnostic = { incidentId: string; code: string; location: string };
const eventName = 'foon:diagnostic-error';

export function GlobalErrorMonitor() {
  const pathname = usePathname();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  useEffect(() => {
    const onDiagnostic = (event: Event) => setDiagnostic((event as CustomEvent<Diagnostic>).detail);
    const originalFetch = window.fetch.bind(window);
    const onError = (event: ErrorEvent) => {
      const incidentId = crypto.randomUUID().slice(0, 8).toUpperCase();
      console.error('[FOON '+incidentId+'] '+pathname, event.error || event.message);
      window.dispatchEvent(new CustomEvent(eventName, { detail: { incidentId, code: 'CLIENT_RUNTIME_ERROR', location: pathname } }));
    };
    const onRejection = (event: PromiseRejectionEvent) => onError({ error: event.reason, message: String(event.reason) } as ErrorEvent);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await originalFetch(...args);
      const input = args[0];
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.startsWith('/api/') && response.status >= 500) {
        const body = await response.clone().json().catch(() => ({})) as { error?: string; incidentId?: string; location?: string };
        const detail = { incidentId: body.incidentId || crypto.randomUUID().slice(0, 8).toUpperCase(), code: body.error || 'HTTP_'+response.status, location: body.location || new URL(url, location.origin).pathname };
        console.error('[FOON '+detail.incidentId+'] '+detail.location+' '+detail.code+' ('+response.status+')');
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
      return response;
    };
    window.addEventListener(eventName, onDiagnostic);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => { window.fetch = originalFetch; window.removeEventListener(eventName, onDiagnostic); window.removeEventListener('error', onError); window.removeEventListener('unhandledrejection', onRejection); };
  }, [pathname]);

  if (!diagnostic) return null;
  const summary = `${diagnostic.code} · ${diagnostic.incidentId} · ${diagnostic.location}`;
  return <aside className="foon-diagnostic" role="alert" aria-live="assertive" dir="auto"><AlertTriangle size={19}/><div className="foon-diagnostic-copy"><strong>تعذر إكمال العملية</strong><span>الخطأ: {diagnostic.code}</span><span>الموقع: {diagnostic.location}</span><span>رمز التتبع: {diagnostic.incidentId}</span></div><button type="button" aria-label="نسخ تفاصيل الخطأ" onClick={()=>void navigator.clipboard?.writeText(summary)}><Copy size={16}/></button><button type="button" aria-label="إغلاق رسالة الخطأ" onClick={()=>setDiagnostic(null)}><X size={18}/></button></aside>;
}

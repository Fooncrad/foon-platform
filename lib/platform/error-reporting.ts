import { z } from 'zod';
import { ApiError } from '@/lib/platform/security';

type ErrorCode = 'INVALID_INPUT' | 'DATABASE_SCHEMA_MISSING' | 'DATABASE_COLUMN_MISSING' | 'DATABASE_CONSTRAINT' | 'DATABASE_ACCESS_DENIED' | 'DATABASE_TIMEOUT' | 'DATABASE_CONNECTION' | 'SERVICE_UNAVAILABLE';

const known: Record<string,{message:string;entity?:string}> = {
 TABLE_NUMBER_EXISTS:{message:'رقم الطاولة موجود مسبقًا. اختر رقمًا آخر.',entity:'الطاولة'},
 TABLE_NUMBER_EXISTS_IN_SECTION:{message:'رقم الطاولة موجود مسبقًا في هذا القسم. اختر رقمًا آخر.',entity:'الطاولة'},
 TABLE_NOT_FOUND:{message:'الطاولة المطلوبة غير موجودة.',entity:'الطاولة'},
 INVALID_TABLE:{message:'الطاولة المحددة غير متاحة أو غير صالحة.',entity:'الطاولة'},
 TABLE_CAPACITY_TOO_SMALL:{message:'سعة الطاولة أقل من عدد الضيوف.',entity:'الطاولة'},
 TABLE_RESERVATION_CONFLICT:{message:'الطاولة مرتبطة بحجز آخر في هذا الوقت.',entity:'الحجز والطاولة'},
 TABLE_HAS_ACTIVE_ORDERS:{message:'لا يمكن إنهاء خدمة الطاولة لوجود طلبات نشطة عليها.',entity:'الطاولة'},
 WAITLIST_NOT_FOUND:{message:'سجل الانتظار المطلوب غير موجود.',entity:'الانتظار'},
 RESERVATION_NOT_FOUND:{message:'الحجز المطلوب غير موجود.',entity:'الحجز'},
 TABLE_REQUIRED:{message:'يجب اختيار طاولة قبل تغيير الحالة إلى تم الجلوس.',entity:'الانتظار'},
 INVALID_WAITER:{message:'النادل المحدد غير متاح أو غير صالح.',entity:'النادل'},
 WAITER_BRANCH_MISMATCH:{message:'النادل المحدد تابع لفرع مختلف عن فرع الطاولة.',entity:'النادل والطاولة'},
 NOT_FOUND:{message:'العنصر المطلوب غير موجود.',entity:'العنصر'},
 INVALID_BRANCH:{message:'الفرع المحدد غير موجود أو غير متاح.',entity:'الفرع'},
 INPUT_TOO_LARGE:{message:'حجم البيانات المرسلة أكبر من الحد المسموح.',entity:'البيانات'},
 INVALID_ACTION:{message:'العملية المطلوبة غير مدعومة.',entity:'العملية'},
};

function humanize(code:string,status:number){const x=known[code];if(x)return x;if(status===401)return {message:'يجب تسجيل الدخول لتنفيذ هذه العملية.',entity:'الحساب'};if(status===403)return {message:'ليس لديك صلاحية لتنفيذ هذه العملية.',entity:'الصلاحية'};if(status===404)return {message:'العنصر المطلوب غير موجود.',entity:'العنصر'};if(status===409)return {message:'تعذر التنفيذ بسبب تعارض مع بيانات موجودة.',entity:'العنصر'};if(status>=500)return {message:'تعذر تنفيذ العملية بسبب مشكلة تقنية. استخدم رقم التتبع عند التواصل مع الدعم.',entity:'النظام'};return {message:'تعذر تنفيذ العملية. راجع البيانات وحاول مجددًا.',entity:'العملية'}}

function classify(error: unknown): ErrorCode {
  if (error instanceof z.ZodError) return 'INVALID_INPUT';
  const message = error instanceof Error ? error.message : String(error);
  if (/doesn't exist|unknown table|no such table|ER_NO_SUCH_TABLE|ER_NO_DB_ERROR|no database selected/i.test(message)) return 'DATABASE_SCHEMA_MISSING';
  if (/unknown column|ER_BAD_FIELD_ERROR/i.test(message)) return 'DATABASE_COLUMN_MISSING';
  if (/foreign key|constraint|ER_DUP_ENTRY|ER_NO_REFERENCED_ROW|ER_ROW_IS_REFERENCED/i.test(message)) return 'DATABASE_CONSTRAINT';
  if (/access denied|ER_ACCESS_DENIED/i.test(message)) return 'DATABASE_ACCESS_DENIED';
  if (/timeout|timed out|ETIMEDOUT/i.test(message)) return 'DATABASE_TIMEOUT';
  if (/connect|ECONN|PROTOCOL_CONNECTION_LOST|DATABASE_NOT_CONFIGURED|pool is closed|too many connections/i.test(message)) return 'DATABASE_CONNECTION';
  return 'SERVICE_UNAVAILABLE';
}

export function apiErrorResponse(error: unknown, location: string, request?: Request, extra: Record<string, unknown> = {}): Response {
  const incidentId = crypto.randomUUID().slice(0, 8).toUpperCase();
  const path = request ? new URL(request.url).pathname : location;
  if (error instanceof ApiError) {
    if (error.status >= 500) console.error(JSON.stringify({ level: 'error', incidentId, location: path, code: error.code, method: request?.method, detail: error.stack }));
    const h=humanize(error.code,error.status);
    return Response.json({ error: error.code, code:error.code, message:h.message, entity:h.entity, reason:h.message, incidentId, location: path, status: error.status, ...extra }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    console.error(JSON.stringify({ level: 'warn', incidentId, location: path, code: 'INVALID_INPUT', issues: error.issues }));
    return Response.json({ error: 'INVALID_INPUT', code:'INVALID_INPUT', message:'بعض الحقول غير صحيحة أو ناقصة.', entity:'البيانات المدخلة', reason:'راجع الحقول المحددة ثم حاول مرة أخرى.', incidentId, location: path, status: 400, issues: error.issues, ...extra }, { status: 400 });
  }
  const code = classify(error);
  const detail = error instanceof Error ? error.stack || error.message : String(error);
  console.error(JSON.stringify({ level: 'error', incidentId, location: path, code, method: request?.method, detail }));
  const h=humanize(code,503);
  return Response.json({ error: code, code, message:h.message, entity:h.entity, reason:h.message, incidentId, location: path, status: 503, ...extra }, { status: 503 });
}

export function classifyRuntimeError(error: unknown): string { return classify(error); }
export function logOperationalError(error: unknown, location: string, operation: string): string {
  const incidentId = crypto.randomUUID().slice(0, 8).toUpperCase();
  console.error(JSON.stringify({ level: 'error', incidentId, code: classify(error), location, operation, detail: error instanceof Error ? error.stack || error.message : String(error) }));
  return incidentId;
}

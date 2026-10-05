import { z } from 'zod';
import { ApiError } from '@/lib/platform/security';

type ErrorCode = 'INVALID_INPUT' | 'DATABASE_SCHEMA_MISSING' | 'DATABASE_COLUMN_MISSING' | 'DATABASE_CONSTRAINT' | 'DATABASE_ACCESS_DENIED' | 'DATABASE_TIMEOUT' | 'DATABASE_CONNECTION' | 'SERVICE_UNAVAILABLE';

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
    return Response.json({ error: error.code, incidentId, location: path, status: error.status, ...extra }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    console.error(JSON.stringify({ level: 'warn', incidentId, location: path, code: 'INVALID_INPUT', issues: error.issues }));
    return Response.json({ error: 'INVALID_INPUT', incidentId, location: path, status: 400, issues: error.issues, ...extra }, { status: 400 });
  }
  const code = classify(error);
  const detail = error instanceof Error ? error.stack || error.message : String(error);
  console.error(JSON.stringify({ level: 'error', incidentId, location: path, code, method: request?.method, detail }));
  return Response.json({ error: code, incidentId, location: path, status: 503, ...extra }, { status: 503 });
}

export function classifyRuntimeError(error: unknown): string { return classify(error); }
export function logOperationalError(error: unknown, location: string, operation: string): string {
  const incidentId = crypto.randomUUID().slice(0, 8).toUpperCase();
  console.error(JSON.stringify({ level: 'error', incidentId, code: classify(error), location, operation, detail: error instanceof Error ? error.stack || error.message : String(error) }));
  return incidentId;
}

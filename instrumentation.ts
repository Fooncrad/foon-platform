import { classifyRuntimeError } from '@/lib/platform/error-reporting';

export async function onRequestError(error: unknown, request: Request, context: { routePath: string; routeType: string }) {
  const incidentId = crypto.randomUUID().slice(0, 8).toUpperCase();
  const detail = error instanceof Error ? error.stack || error.message : String(error);
  console.error(JSON.stringify({ level: 'error', incidentId, code: classifyRuntimeError(error), location: context.routePath || new URL(request.url).pathname, routeType: context.routeType, method: request.method, detail }));
}

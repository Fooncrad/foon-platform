type RuntimeErrorCode='DATABASE_SCHEMA_MISSING'|'DATABASE_COLUMN_MISSING'|'DATABASE_CONSTRAINT'|'DATABASE_ACCESS_DENIED'|'DATABASE_TIMEOUT'|'DATABASE_CONNECTION'|'SERVICE_UNAVAILABLE';
function classifyRuntimeError(error:unknown):RuntimeErrorCode{
 const message=error instanceof Error?error.message:String(error);
 if(/doesn't exist|unknown table|no such table|ER_NO_SUCH_TABLE|ER_NO_DB_ERROR|no database selected/i.test(message))return 'DATABASE_SCHEMA_MISSING';
 if(/unknown column|ER_BAD_FIELD_ERROR/i.test(message))return 'DATABASE_COLUMN_MISSING';
 if(/foreign key|constraint|ER_DUP_ENTRY|ER_NO_REFERENCED_ROW|ER_ROW_IS_REFERENCED/i.test(message))return 'DATABASE_CONSTRAINT';
 if(/access denied|ER_ACCESS_DENIED/i.test(message))return 'DATABASE_ACCESS_DENIED';
 if(/timeout|timed out|ETIMEDOUT/i.test(message))return 'DATABASE_TIMEOUT';
 if(/connect|ECONN|PROTOCOL_CONNECTION_LOST|DATABASE_NOT_CONFIGURED|pool is closed|too many connections/i.test(message))return 'DATABASE_CONNECTION';
 return 'SERVICE_UNAVAILABLE';
}

export async function onRequestError(error:unknown,request:Request,context:{routePath:string;routeType:string}){
 const incidentId=crypto.randomUUID().slice(0,8).toUpperCase();
 const detail=error instanceof Error?error.stack||error.message:String(error);
 console.error(JSON.stringify({level:'error',incidentId,code:classifyRuntimeError(error),location:context.routePath||new URL(request.url).pathname,routeType:context.routeType,method:request.method,detail}));
}

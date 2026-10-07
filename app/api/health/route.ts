import {getPool} from '@/db/mysql.mjs';
export const dynamic='force-dynamic';
export const runtime='nodejs';

type DbError=Error&{code?:string;errno?:number;sqlState?:string;fatal?:boolean};

function safeError(error:unknown){
 const e=error as DbError;
 return {
  code:e?.code??'DATABASE_UNAVAILABLE',
  errno:typeof e?.errno==='number'?e.errno:undefined,
  sqlState:e?.sqlState||undefined,
  fatal:typeof e?.fatal==='boolean'?e.fatal:undefined,
 };
}

export async function GET(){
 const started=Date.now();
 const host=process.env.DATABASE_URL?'DATABASE_URL':(process.env.DB_HOST||'missing');
 let connection:any;
 let stage='connection';
 try{
  connection=await getPool().getConnection();
  stage='query';
  const [rows]=await connection.query('SELECT 1 AS ok');
  return Response.json({
   ok:true,
   app:'foon-platform',
   runtime:process.version,
   database:'ok',
   stage:'complete',
   host,
   result:Array.isArray(rows)?'ok':'unexpected',
   latencyMs:Date.now()-started,
  },{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const detail=safeError(error);
  console.error('[health:database]',{stage,...detail});
  return Response.json({
   ok:false,
   app:'foon-platform',
   runtime:process.version,
   database:'unavailable',
   stage,
   host,
   ...detail,
   latencyMs:Date.now()-started,
  },{status:503,headers:{'Cache-Control':'no-store'}});
 }finally{
  connection?.release?.();
 }
}

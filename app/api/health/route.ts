import {database} from '@/db';
export const dynamic='force-dynamic';
export const runtime='nodejs';
function timeout(ms:number){return new Promise<never>((_,reject)=>setTimeout(()=>reject(Object.assign(new Error('HEALTH_DB_TIMEOUT'),{code:'HEALTH_DB_TIMEOUT'})),ms));}
export async function GET(){
 const started=Date.now();
 try{
  await Promise.race([database().prepare('SELECT 1 AS ok').first(),timeout(2500)]);
  return Response.json({ok:true,app:'foon-platform',runtime:process.version,database:'ok',latencyMs:Date.now()-started},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const e=error as {code?:string};
  console.error('[health:database]',e?.code??error);
  return Response.json({ok:false,app:'foon-platform',runtime:process.version,database:'unavailable',code:e?.code??'DATABASE_UNAVAILABLE',latencyMs:Date.now()-started},{status:503,headers:{'Cache-Control':'no-store'}});
 }
}

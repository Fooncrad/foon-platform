import {z} from 'zod';
import {database} from '@/db';
import {ApiError,audit,authorize,sameOrigin} from '@/lib/platform/security';
import {apiErrorResponse} from '@/lib/platform/error-reporting';
export const dynamic='force-dynamic';

const position=z.enum(['cover','menu','bottom']);
const action=z.object({visible:z.boolean(),position});
const settingsSchema=z.object({
 template:z.enum(['grid','list','gallery']).default('grid'),
 theme:z.object({
  primary:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#f28c28'),
  background:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  corners:z.enum(['rounded','soft','square']).default('rounded')
 }).default({primary:'#f28c28',background:'#ffffff',corners:'rounded'}),
 actions:z.record(z.string(),action).default({}),
 header:z.enum(['compact','full']).default('compact'),
 footer:z.enum(['compact','full']).default('full'),
 contact:z.object({
  phone:z.string().max(40).default(''),email:z.string().max(180).default(''),
  whatsapp:z.string().max(40).default(''),location:z.string().max(500).default(''),
  instagram:z.string().max(180).default(''),tiktok:z.string().max(180).default(''),
  snapchat:z.string().max(180).default(''),website:z.string().max(500).default('')
 }).default({phone:'',email:'',whatsapp:'',location:'',instagram:'',tiktok:'',snapchat:'',website:''})
}).strip();

const defaults=settingsSchema.parse({
 actions:{
  waiter:{visible:true,position:'cover'},reservation:{visible:true,position:'cover'},
  language:{visible:true,position:'menu'},dark:{visible:true,position:'menu'},account:{visible:true,position:'menu'}
 }
});

function fail(e:unknown,req:Request){return apiErrorResponse(e,'/api/restaurant/appearance',req)}
function parseStored(v:string|null|undefined){if(!v)return null;try{return settingsSchema.parse(JSON.parse(v))}catch{return null}}
async function context(slug:string){
 if(!slug)throw new ApiError(400,'INVALID_SLUG');
 const row=await database().prepare("SELECT id FROM tenants WHERE slug=? AND activity_id='restaurants' LIMIT 1").bind(slug).first<{id:string}>();
 if(!row)throw new ApiError(404,'NOT_FOUND');
 const auth=await authorize(row.id);
 return {tenantId:row.id,userId:auth.userId};
}
async function safeAudit(userId:string,actionName:string,tenantId:string){
 try{await audit(userId,actionName,tenantId)}catch(error){console.error('[appearance:audit]',error)}
}

export async function GET(req:Request){
 try{
  const {tenantId}=await context(new URL(req.url).searchParams.get('slug')||'');
  const row=await database().prepare('SELECT draft_json,published_json,published_at FROM restaurant_appearance_settings WHERE tenant_id=? LIMIT 1').bind(tenantId).first<{draft_json:string|null;published_json:string|null;published_at:number|null}>();
  return Response.json({draft:parseStored(row?.draft_json)||defaults,published:parseStored(row?.published_json)||defaults,publishedAt:row?.published_at??null});
 }catch(error){return fail(error,req)}
}

export async function POST(req:Request){
 try{
  sameOrigin(req);
  const body=await req.json() as {slug?:unknown;action?:unknown;settings?:unknown};
  const slug=typeof body.slug==='string'?body.slug:'';
  const operation=body.action;
  if(operation!=='save'&&operation!=='publish')throw new ApiError(400,'INVALID_ACTION');
  const value=settingsSchema.parse(body.settings);
  const {tenantId,userId}=await context(slug);
  const now=Date.now(),json=JSON.stringify(value);
  if(operation==='publish'){
   await database().prepare('UPDATE restaurant_appearance_settings SET draft_json=?,published_json=?,updated_at=?,published_at=? WHERE tenant_id=?').bind(json,json,now,now,tenantId).run();
   await safeAudit(userId,'restaurant.appearance.published',tenantId);
   return Response.json({ok:true,publishedAt:now});
  }
  await database().prepare('UPDATE restaurant_appearance_settings SET draft_json=?,updated_at=? WHERE tenant_id=?').bind(json,now,tenantId).run();
  await safeAudit(userId,'restaurant.appearance.saved',tenantId);
  return Response.json({ok:true});
 }catch(error){return fail(error,req)}
}

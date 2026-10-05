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
 pages:z.record(z.string(),z.object({enabled:z.boolean().default(true),title:z.string().max(120),title_en:z.string().max(120).optional(),title_fr:z.string().max(120).optional(),content:z.string().max(8000),content_en:z.string().max(8000).optional(),content_fr:z.string().max(8000).optional()})).default({}),
 contact:z.object({
  phone:z.string().max(40).default(''),email:z.string().max(180).default(''),
  whatsapp:z.string().max(40).default(''),location:z.string().max(500).default(''),
  instagram:z.string().max(180).default(''),tiktok:z.string().max(180).default(''),
  snapchat:z.string().max(180).default(''),website:z.string().max(500).default('')
 }).default({phone:'',email:'',whatsapp:'',location:'',instagram:'',tiktok:'',snapchat:'',website:''})
}).strip();

const defaults=settingsSchema.parse({
 pages:{
  about:{enabled:true,title:'من نحن',title_en:'About us',title_fr:'À propos',content:'مرحبًا بكم في مطعمنا. نحرص على تقديم تجربة ضيافة مميزة وأطباق مختارة بعناية وجودة ثابتة. هدفنا أن تكون كل زيارة تجربة تستحق التكرار.',content_en:'Welcome to our restaurant. We focus on warm hospitality, carefully selected dishes and consistent quality.',content_fr:'Bienvenue dans notre restaurant. Nous privilégions un accueil chaleureux, des plats soigneusement sélectionnés et une qualité constante.'},
  contact:{enabled:true,title:'تواصل معنا',title_en:'Contact us',title_fr:'Contact',content:'يسعدنا تواصلكم معنا للاستفسارات والملاحظات والحجوزات. يمكنكم استخدام بيانات التواصل المعروضة في المنيو وسنكون سعداء بخدمتكم.',content_en:'We are happy to hear from you for questions, feedback and reservations.',content_fr:'Nous sommes à votre écoute pour vos questions, remarques et réservations.'},
  terms:{enabled:true,title:'الشروط والأحكام',title_en:'Terms & conditions',title_fr:'Conditions générales',content:'باستخدام خدمات المطعم أو تنفيذ الطلب، يوافق العميل على تفاصيل الطلب والأسعار والرسوم الظاهرة قبل التأكيد. قد تختلف أوقات التجهيز حسب ضغط الطلبات وتوفر الأصناف.',content_en:'By using the restaurant services or placing an order, the customer accepts the order details, prices and displayed fees before confirmation.',content_fr:'En utilisant les services du restaurant ou en passant commande, le client accepte les détails, prix et frais affichés avant confirmation.'},
  privacy:{enabled:true,title:'سياسة الخصوصية',title_en:'Privacy policy',title_fr:'Politique de confidentialité',content:'نستخدم بيانات العميل اللازمة لتنفيذ الطلب أو الحجز وتقديم الخدمة والتواصل بشأنها. لا نستخدم البيانات خارج أغراض التشغيل إلا وفق الأنظمة المعمول بها.',content_en:'We use only the customer information needed to fulfil orders, reservations and related service communication.',content_fr:'Nous utilisons uniquement les informations nécessaires aux commandes, réservations et communications associées.'},
  refund:{enabled:true,title:'سياسة الإلغاء والاسترجاع',title_en:'Cancellation & refunds',title_fr:'Annulation et remboursement',content:'يمكن طلب الإلغاء قبل بدء تجهيز الطلب وفق حالة الطلب. تتم مراجعة طلبات الاسترجاع بحسب وسيلة الدفع وحالة الخدمة، وتوضح أي رسوم أو استثناءات قبل إتمام العملية.',content_en:'Cancellation may be requested before preparation starts. Refund requests are reviewed according to payment method and service status.',content_fr:'Une annulation peut être demandée avant la préparation. Les remboursements sont examinés selon le paiement et le statut du service.'}
 },
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

import {database} from '@/db';
export const dynamic='force-dynamic';
type Row=Record<string,unknown>;
async function ensureCorePlans(){const db=database();const count=await db.prepare('SELECT COUNT(*) AS n FROM package_plans').first<{n:number|string}>();if(Number(count?.n||0)===0){const now=Date.now();await db.prepare("INSERT IGNORE INTO package_plans(id,name_ar,name_en,monthly_price,currency,enabled,created_at) VALUES ('starter','البداية','Starter',0,'SAR',1,?),('business','الأعمال','Business',399.00,'SAR',1,?)").bind(now,now).run()}}
export async function GET(){try{
 const db=database();await ensureCorePlans();
 const base=await db.prepare('SELECT id,name_ar,name_en,monthly_price,currency,enabled FROM package_plans WHERE enabled=1 ORDER BY monthly_price ASC,created_at ASC').all<Row>();
 let meta:Row[]=[];let features:Row[]=[];
 try{meta=(await db.prepare('SELECT plan_id,description_ar,description_en,description_fr,plan_type,yearly_price FROM package_plan_meta').all<Row>()).results}catch{}
 try{features=(await db.prepare('SELECT pf.plan_id,pf.feature_id,pf.enabled,pf.feature_limit,f.label_ar,f.label_en,f.label_fr FROM package_plan_features pf JOIN feature_definitions f ON f.id=pf.feature_id WHERE pf.enabled=1 ORDER BY f.label_en ASC').all<Row>()).results}catch{}
 const plans=base.results.map(p=>({...p,...(meta.find(m=>m.plan_id===p.id)||{}),features:features.filter(x=>x.plan_id===p.id)}));
 return Response.json({plans},{headers:{'Cache-Control':'no-store'}});
}catch(e){console.error('Public plans failed',e instanceof Error?e.message:'Unknown');const message=e instanceof Error?e.message:'';const code=/doesn't exist|no such table/i.test(message)?'PLANS_SCHEMA_MISSING':'PLANS_UNAVAILABLE';return Response.json({error:code},{status:503})}}

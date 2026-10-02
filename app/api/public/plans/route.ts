import {database} from '@/db';
export const dynamic='force-dynamic';
type Row=Record<string,unknown>;
export async function GET(){try{
 const db=database();
 const base=await db.prepare('SELECT id,name_ar,name_en,monthly_price,currency,enabled FROM package_plans WHERE enabled=1 ORDER BY monthly_price ASC,created_at ASC').all<Row>();
 let meta:Row[]=[];let features:Row[]=[];
 try{meta=(await db.prepare('SELECT plan_id,description_ar,description_en,description_fr,plan_type,yearly_price FROM package_plan_meta').all<Row>()).results}catch{}
 try{features=(await db.prepare('SELECT pf.plan_id,pf.feature_id,pf.enabled,pf.feature_limit,f.label_ar,f.label_en,f.label_fr FROM package_plan_features pf JOIN feature_definitions f ON f.id=pf.feature_id WHERE pf.enabled=1 ORDER BY f.label_en ASC').all<Row>()).results}catch{}
 const plans=base.results.map(p=>({...p,...(meta.find(m=>m.plan_id===p.id)||{}),features:features.filter(x=>x.plan_id===p.id)}));
 return Response.json({plans},{headers:{'Cache-Control':'public, max-age=60, stale-while-revalidate=300'}});
}catch(e){console.error('Public plans failed',e instanceof Error?e.name:'Unknown');return Response.json({error:'PLANS_UNAVAILABLE'},{status:503})}}

import OperationsSettings from '@/components/restaurant/operations-settings';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import {redirect} from 'next/navigation';

export default async function PrintingPage({params}:{params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');const {slug}=await params;
 const t=await database().prepare("SELECT t.id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{id:string}>();
 if(!t)redirect('/restaurant');
 const safe=async(sql:string)=>{try{return (await database().prepare(sql).bind(t.id).all<any>()).results}catch{return []}};
 const [printers,stations,items]=await Promise.all([
  safe("SELECT id,name,station,connection_type,enabled FROM restaurant_printers WHERE tenant_id=? ORDER BY name"),
  safe("SELECT id,name,station_key,enabled FROM restaurant_kds_stations WHERE tenant_id=? ORDER BY name"),
  safe("SELECT mi.id,mi.name_ar,mi.name_en,mi.name_fr,COALESCE(msr.station_key,'kitchen') station_key FROM menu_items mi LEFT JOIN menu_item_station_routes msr ON msr.tenant_id=mi.tenant_id AND msr.menu_item_id=mi.id WHERE mi.tenant_id=? AND mi.enabled=1 ORDER BY mi.name_ar LIMIT 500")
 ]);
 return <div className="restaurant-v2-workspace"><section className="restaurant-v2-card"><header><div><small>الإخراج والتوجيه</small><h2>الطباعة</h2></div></header><p className="restaurant-v2-empty">إدارة الطابعات، محطات التحضير وربط الأصناف بوجهة الطباعة. هذا القسم مستقل عن إعداد المطعم والطاولات والحجوزات.</p></section><OperationsSettings slug={slug} stations={stations} printers={printers} items={items}/></div>
}
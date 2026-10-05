import OrderTypeSettings from '@/components/restaurant/order-type-settings';
import OrderPolicies from '@/components/restaurant/order-policies';
import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';

export default async function Page({params}:{params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');const {slug}=await params;
 const t=await database().prepare("SELECT t.id,t.name,t.slug,t.phone,t.whatsapp,t.email_public,t.address_ar,t.currency,t.country,t.timezone FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? LIMIT 1").bind(user.userId,slug).first<any>();
 if(!t)redirect('/restaurant');
 const safe=async(sql:string)=>{try{return (await database().prepare(sql).bind(t.id).all<any>()).results}catch{return []}};
 const [branches,qrs,orderTypeRows,policies,hours,deliveryCapacity]=await Promise.all([
  safe("SELECT id,name,is_primary FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,name"),
  safe("SELECT id,label,service_type,reference_value,enabled FROM restaurant_qr_profiles WHERE tenant_id=? ORDER BY created_at DESC"),
  safe("SELECT order_type,enabled FROM restaurant_order_type_settings WHERE tenant_id=?"),
  safe("SELECT * FROM restaurant_order_policies WHERE tenant_id=?"),
  safe("SELECT * FROM restaurant_business_hours WHERE tenant_id=? ORDER BY day_of_week"),
  safe("SELECT available_drivers FROM restaurant_delivery_capacity WHERE tenant_id=?")
 ]);
 const defaults:any={pickup:true,takeaway:true,dine_in:true,delivery:true,room_service:true,reservation:true};for(const row of orderTypeRows)if(row.order_type in defaults)defaults[row.order_type]=Boolean(Number(row.enabled));
 return <div className="restaurant-v2-workspace">
  <section className="restaurant-v2-card"><header><div><small>هوية المطعم</small><h2>إعداد المطعم</h2></div></header><div className="restaurant-v2-status"><div><b>{t.name}</b><small>اسم المطعم</small></div><div><b>{t.currency||'SAR'}</b><small>العملة</small></div><div><b>{t.country||'SA'}</b><small>الدولة</small></div><div><b>{t.timezone||'Asia/Riyadh'}</b><small>المنطقة الزمنية</small></div><div><b>{branches.length}</b><small>الفروع</small></div></div><p className="restaurant-v2-empty">الشعار والكفر والألوان والقالب والصفحات العامة تُدار من «المظهر والواجهة». هذا القسم مخصص لبيانات المطعم وسياسات الخدمة فقط، ولا يحتوي على الطاولات أو الحجوزات أو النادل أو الطباعة.</p></section>
  <div className="restaurant-v2-grid"><section className="restaurant-v2-primary"><OrderTypeSettings slug={slug} initial={defaults}/><OrderPolicies slug={slug} policies={policies} hours={hours} drivers={Number(deliveryCapacity[0]?.available_drivers||0)}/></section>
   <aside className="restaurant-v2-secondary"><article className="restaurant-v2-card"><header><div><small>هوية الوصول</small><h2>QR العام</h2></div></header>{qrs.length?<div className="restaurant-v2-orders">{qrs.map(x=><div key={x.id}><span><b>{x.label}</b><small>{x.service_type}</small></span><strong>{x.reference_value||'—'}</strong></div>)}</div>:<div className="restaurant-v2-empty">QR المنيو العام مرتبط برابط المطعم. QR الطاولات أصبح داخل قسم الطاولات والحجوزات والنادل.</div>}</article></aside>
  </div>
 </div>
}
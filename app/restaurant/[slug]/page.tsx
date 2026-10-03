import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import RestaurantDashboard from '@/components/restaurant/restaurant-dashboard';
export default async function RestaurantWorkspace({params}:{params:Promise<{slug:string}>}){const user=await requireUser('/restaurant');const {slug}=await params;const m=await database().prepare("SELECT t.id,t.slug,t.name,t.status,t.currency FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{id:string;slug:string;name:string;status:string;currency:string}>();if(!m){const f=await database().prepare("SELECT t.slug FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.activity_id='restaurants' ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{slug:string}>();if(!f)redirect('/register/restaurant');redirect('/restaurant/'+encodeURIComponent(f.slug))}
 const safe=async<T>(sql:string,...args:any[])=>{try{return await database().prepare(sql).bind(...args).first<T>()}catch{return undefined}};
 const rows=async(sql:string,...args:any[])=>{try{return (await database().prepare(sql).bind(...args).all()).results}catch{return []}};
 const [counts,sales,statuses,recent,sub,features]=await Promise.all([
  safe<any>("SELECT (SELECT COUNT(*) FROM menu_items WHERE tenant_id=?) items,(SELECT COUNT(*) FROM menu_categories WHERE tenant_id=?) categories,(SELECT COUNT(*) FROM restaurant_orders WHERE tenant_id=?) orders",m.id,m.id,m.id),
  safe<any>("SELECT COALESCE(SUM(total),0) total,COUNT(*) count FROM restaurant_orders WHERE tenant_id=? AND status IN ('completed','delivered')",m.id),
  rows("SELECT status,COUNT(*) count FROM restaurant_orders WHERE tenant_id=? GROUP BY status",m.id),
  rows("SELECT id,reference,source,status,customer_name,total,currency,created_at FROM restaurant_orders WHERE tenant_id=? ORDER BY created_at DESC LIMIT 8",m.id),
  safe<any>("SELECT s.plan_id,s.status,s.starts_at,s.expires_at,p.name_ar,p.name_en FROM subscriptions s JOIN package_plans p ON p.id=s.plan_id WHERE s.tenant_id=? ORDER BY s.created_at DESC LIMIT 1",m.id),
  rows("SELECT COUNT(*) total,SUM(CASE WHEN pf.enabled=1 THEN 1 ELSE 0 END) enabled FROM package_plan_features pf WHERE pf.plan_id=(SELECT plan_id FROM subscriptions WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1)",m.id)
 ]);
 const byStatus=Object.fromEntries((statuses as any[]).map(x=>[String(x.status),Number(x.count)]));const feat=(features as any[])[0]||{};
 return <main className="restaurant-workspace-shell"><RestaurantDashboard slug={m.slug} name={m.name} status={m.status} currency={m.currency} itemCount={Number(counts?.items||0)} categoryCount={Number(counts?.categories||0)} orderCount={Number(counts?.orders||0)} revenue={Number(sales?.total||0)} completedSales={Number(sales?.count||0)} orderStatuses={byStatus} recentOrders={recent as any[]} subscription={sub?{planId:sub.plan_id,status:sub.status,nameAr:sub.name_ar,nameEn:sub.name_en,startsAt:sub.starts_at,expiresAt:sub.expires_at,enabledFeatures:Number(feat.enabled||0),totalFeatures:Number(feat.total||0)}:null}/></main>
}
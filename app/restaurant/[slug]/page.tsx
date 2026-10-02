import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import RestaurantDashboard from '@/components/restaurant/restaurant-dashboard';

export default async function RestaurantWorkspace({params}:{params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');
 const {slug}=await params;
 const membership=await database().prepare("SELECT t.id,t.slug,t.name,t.status,t.currency FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{id:string;slug:string;name:string;status:string;currency:string}>();
 if(!membership){
  const fallback=await database().prepare("SELECT t.slug FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.activity_id='restaurants' ORDER BY t.created_at ASC LIMIT 1").bind(user.userId).first<{slug:string}>();
  if(!fallback)redirect('/register/restaurant');
  redirect('/restaurant/'+encodeURIComponent(fallback.slug));
 }
 const safeCount=async(sql:string,...args:string[])=>{try{const r=await database().prepare(sql).bind(...args).first<{total:number|string}>();return Number(r?.total??0)}catch{return 0}};
 const [categoryCount,itemCount,orderCount,openOrderCount]=await Promise.all([
  safeCount('SELECT COUNT(*) total FROM menu_categories WHERE tenant_id=?',membership.id),
  safeCount('SELECT COUNT(*) total FROM menu_items WHERE tenant_id=?',membership.id),
  safeCount('SELECT COUNT(*) total FROM restaurant_orders WHERE tenant_id=?',membership.id),
  safeCount("SELECT COUNT(*) total FROM restaurant_orders WHERE tenant_id=? AND status NOT IN ('completed','cancelled')",membership.id)
 ]);
 return <main className="restaurant-workspace-shell"><RestaurantDashboard slug={membership.slug} name={membership.name} status={membership.status} currency={membership.currency} categoryCount={categoryCount} itemCount={itemCount} orderCount={orderCount} openOrderCount={openOrderCount}/></main>
}

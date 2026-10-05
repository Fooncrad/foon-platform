import ReservationsManager from '@/components/restaurant/reservations-manager';
import TablesManager from '@/components/restaurant/tables-manager';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import {redirect} from 'next/navigation';

export default async function ReservationsPage({params}:{params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');const {slug}=await params;
 const tenant=await database().prepare("SELECT t.id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{id:string}>();
 if(!tenant)redirect('/restaurant');
 let branches:any[]=[];try{branches=(await database().prepare("SELECT id,name,is_primary FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,name").bind(tenant.id).all<any>()).results}catch{}
 return <div className="restaurant-v2-workspace">\n  <nav className="restaurant-orders-toolbar" aria-label="تشغيل الصالة"><a href="#bookings">الحجوزات والانتظار</a><a href="#tables">الطاولات وQR</a><a href="#tables">النادل والنداءات</a><a href="#tables">الرسوم والسياسات</a></nav>
  <section className="restaurant-v2-card"><header><div><small>تشغيل الصالة</small><h2>الطاولات والحجوزات والانتظار والنادل</h2></div></header><p className="restaurant-v2-empty">مركز واحد لحالة الطاولات، الحجز المسبق، قائمة الانتظار، QR الطاولة وتعيين النادل ونداءات الخدمة.</p></section>
  <section id="bookings"><ReservationsManager slug={slug}/></section>
  <section id="tables"><TablesManager slug={slug} branches={branches}/></section>
 </div>
}
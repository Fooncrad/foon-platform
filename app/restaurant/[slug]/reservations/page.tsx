import ReservationsManager from '@/components/restaurant/reservations-manager';
import TablesManager from '@/components/restaurant/tables-manager';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import {redirect} from 'next/navigation';

export default async function ReservationsPage({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{view?:string}>}){
 const user=await requireUser('/restaurant');const {slug}=await params;const {view='bookings'}=await searchParams;
 const tenant=await database().prepare("SELECT t.id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{id:string}>();
 if(!tenant)redirect('/restaurant');
 let branches:any[]=[];try{branches=(await database().prepare("SELECT id,name,is_primary FROM branches WHERE tenant_id=? ORDER BY is_primary DESC,name").bind(tenant.id).all<any>()).results}catch{}
 const current=['bookings','tables','waiter','policies'].includes(view)?view:'bookings';
 return <div className="restaurant-v2-workspace">
  <nav className="restaurant-orders-toolbar restaurant-operation-tabs" aria-label="تشغيل الصالة">
   <a className={current==='bookings'?'active':''} href={'?view=bookings'}>الحجوزات والانتظار</a>
   <a className={current==='tables'?'active':''} href={'?view=tables'}>الطاولات وQR</a>
   <a className={current==='waiter'?'active':''} href={'?view=waiter'}>النادل والنداءات</a>
   <a className={current==='policies'?'active':''} href={'?view=policies'}>الرسوم والسياسات</a>
  </nav>
  {current==='bookings'&&<section><ReservationsManager slug={slug}/></section>}
  {current==='tables'&&<section><TablesManager slug={slug} branches={branches} view="tables"/></section>}
  {current==='waiter'&&<section><TablesManager slug={slug} branches={branches} view="waiter"/></section>}
  {current==='policies'&&<section><TablesManager slug={slug} branches={branches} view="policies"/></section>}
 </div>
}
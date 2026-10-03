'use client';
import Link from 'next/link';
import {CalendarDays,ChefHat,ClipboardList,PackageOpen,ShoppingCart,TrendingUp,UtensilsCrossed} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';
type Order={id:string;reference:string;source:string;status:string;customer_name?:string|null;total:number|string;currency:string;created_at:number};
type Sub={planId:string;status:string;nameAr:string;nameEn:string;startsAt:number|null;expiresAt:number|null;enabledFeatures:number;totalFeatures:number};
type SaleSource={source:string;count:number|string;total:number|string}; type MonthSale={year:number|string;month:number|string;total:number|string};
type Props={sourceSales:SaleSource[];monthlySales:MonthSale[];slug:string;name:string;status:string;currency:string;categoryCount:number;itemCount:number;orderCount:number;revenue:number;completedSales:number;orderStatuses:Record<string,number>;recentOrders:Order[];subscription:Sub|null};
export default function RestaurantDashboard(p:Props){
 const {locale}=usePreferences(); const ar=locale==='ar'; const L=(a:string,e:string,f=e)=>ar?a:locale==='fr'?f:e; const base='/restaurant/'+encodeURIComponent(p.slug);
 const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:p.currency||'SAR'}).format(n);
 const count=(...k:string[])=>k.reduce((n,x)=>n+(p.orderStatuses[x]||0),0); const pending=count('new','pending','confirmed','preparing'),completed=count('completed'),delivered=count('delivered'),cancelled=count('cancelled','canceled');
 const max=Math.max(...p.monthlySales.map(s=>Number(s.total)),1);
 return <div className="restaurant-v2-workspace">
  <section className="restaurant-v2-kpis">
   <article><span><ShoppingCart/></span><div><small>{L('طلبات تحتاج متابعة','Orders to handle','Commandes à traiter')}</small><b>{pending}</b></div></article>
   <article><span><TrendingUp/></span><div><small>{L('مبيعات اليوم','Sales total','Ventes')}</small><b>{money(p.revenue)}</b></div></article>
   <article><span><UtensilsCrossed/></span><div><small>{L('الأصناف','Menu items','Articles')}</small><b>{p.itemCount}</b></div></article>
   <article><span><CalendarDays/></span><div><small>{L('الحجوزات','Reservations','Réservations')}</small><b>—</b></div></article>
  </section>
  <section className="restaurant-v2-actions">
   <Link href={base+'/orders'}><ClipboardList/><div><b>{L('الطلبات المباشرة','Live orders','Commandes')}</b><small>{pending} {L('تحتاج متابعة','need attention','à traiter')}</small></div><strong>›</strong></Link>
   <Link href={base+'/reservations'}><CalendarDays/><div><b>{L('الحجوزات والانتظار','Reservations & waitlist','Réservations et attente')}</b><small>{L('إدارة المقاعد والدور','Manage seating and queue','Gérer les places')}</small></div><strong>›</strong></Link>
   <Link href={base+'/kds'}><ChefHat/><div><b>KDS</b><small>{L('شاشة تشغيل المطبخ','Kitchen operations','Opérations cuisine')}</small></div><strong>›</strong></Link>
  </section>
  <div className="restaurant-v2-grid">
   <section className="restaurant-v2-primary">
    <article className="restaurant-v2-card restaurant-v2-chart"><header><div><small>{L('الأداء','Performance','Performance')}</small><h2>{L('المبيعات','Sales','Ventes')}</h2></div><b>{money(p.revenue)}</b></header>{p.monthlySales.length?<div className="restaurant-v2-bars">{p.monthlySales.slice(-12).map(s=>{const v=Number(s.total);return <div key={String(s.year)+'-'+String(s.month)}><i style={{height:Math.max(5,v/max*100)+'%'}}/><small>{String(s.month).padStart(2,'0')}</small></div>})}</div>:<div className="restaurant-v2-empty">{L('ستظهر بيانات المبيعات هنا عند بدء التشغيل.','Sales data will appear here once operations begin.','Les ventes apparaîtront ici.')}</div>}</article>
    <article className="restaurant-v2-card"><header><div><small>{L('التشغيل الآن','Live operations','Opérations')}</small><h2>{L('حالة الطلبات','Order status','Statut des commandes')}</h2></div></header><div className="restaurant-v2-status"><div><b>{pending}</b><small>{L('قيد التنفيذ','Pending','En attente')}</small></div><div><b>{completed}</b><small>{L('مكتمل','Completed','Terminées')}</small></div><div><b>{delivered}</b><small>{L('تم التوصيل','Delivered','Livrées')}</small></div><div><b>{cancelled}</b><small>{L('ملغي','Cancelled','Annulées')}</small></div></div></article>
    <article className="restaurant-v2-card"><header><div><small>{L('آخر النشاط','Latest activity','Activité récente')}</small><h2>{L('آخر الطلبات','Recent orders','Commandes récentes')}</h2></div><Link href={base+'/orders'}>{L('عرض الكل','View all','Tout voir')}</Link></header>{p.recentOrders.length?<div className="restaurant-v2-orders">{p.recentOrders.map(o=><div key={o.id}><span><b>{o.reference}</b><small>{o.customer_name||o.source} · {o.status}</small></span><strong>{money(Number(o.total))}</strong></div>)}</div>:<div className="restaurant-v2-empty">{L('لا توجد طلبات حديثة.','No recent orders.','Aucune commande récente.')}</div>}</article>
   </section>
   <aside className="restaurant-v2-secondary">
    <article className="restaurant-v2-card restaurant-v2-menu-summary"><header><div><small>{L('المحتوى','Catalog','Catalogue')}</small><h2>{L('المنيو','Menu','Menu')}</h2></div><Link href={base+'/menu'}>{L('إدارة','Manage','Gérer')}</Link></header><div><span><b>{p.itemCount}</b><small>{L('صنف','Items','Articles')}</small></span><span><b>{p.categoryCount}</b><small>{L('قسم','Categories','Catégories')}</small></span></div></article>
    <article className="restaurant-v2-card restaurant-v2-plan"><header><div><small>{L('الحساب','Account','Compte')}</small><h2>{L('الباقة','Plan','Forfait')}</h2></div><PackageOpen/></header>{p.subscription?<><b>{p.subscription.nameAr||p.subscription.nameEn}</b><small>{p.subscription.status} · {p.subscription.enabledFeatures}/{p.subscription.totalFeatures} {L('خصائص','features','fonctionnalités')}</small></>:<small>{L('لا يوجد اشتراك مرتبط','No linked subscription','Aucun abonnement')}</small>}</article>
   </aside>
  </div>
 </div>
}

'use client';
import Link from 'next/link';
import {CalendarDays,ChefHat,ClipboardList,PackageOpen,ShoppingCart,TrendingUp,UtensilsCrossed} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';
type Order={id:string;reference:string;source:string;status:string;customer_name?:string|null;total:number|string;currency:string;created_at:number};
type Sub={planId:string;status:string;nameAr:string;nameEn:string;startsAt:number|null;expiresAt:number|null;enabledFeatures:number;totalFeatures:number};
type SaleSource={source:string;count:number|string;total:number|string};
type MonthSale={year:number|string;month:number|string;total:number|string};
type Props={sourceSales:SaleSource[];monthlySales:MonthSale[];slug:string;name:string;status:string;currency:string;categoryCount:number;itemCount:number;orderCount:number;revenue:number;completedSales:number;reservationsCount:number|null;orderStatuses:Record<string,number>;recentOrders:Order[];subscription:Sub|null};
export default function RestaurantDashboard(p:Props){
 const {locale}=usePreferences();
 const ar=locale==='ar';
 const L=(a:string,e:string,f=e)=>ar?a:locale==='fr'?f:e;
 const base='/restaurant/'+encodeURIComponent(p.slug);
 const money=(value:number)=>new Intl.NumberFormat(ar?'ar-SA':locale==='fr'?'fr-FR':'en-US',{style:'currency',currency:p.currency||'SAR',maximumFractionDigits:2}).format(value);
 const count=(...keys:string[])=>keys.reduce((total,key)=>total+(p.orderStatuses[key]||0),0);
 const pending=count('new','pending','confirmed','preparing');
 const completed=count('completed');
 const delivered=count('delivered');
 const cancelled=count('cancelled','canceled','no_show');
 const max=Math.max(...p.monthlySales.map(sale=>Number(sale.total)),1);
 const statusText=(status:string)=>{const labels:Record<string,string>={active:L('نشط','Active','Actif'),trial:L('تجريبي','Trial','Essai'),pending:L('بانتظار التفعيل','Pending','En attente'),suspended:L('موقوف','Suspended','Suspendu'),inactive:L('غير نشط','Inactive','Inactif')};return labels[status]||status};
 const orderStatusText=(status:string)=>{const labels:Record<string,string>={new:L('جديد','New','Nouveau'),pending:L('قيد الانتظار','Pending','En attente'),confirmed:L('مؤكد','Confirmed','Confirmé'),preparing:L('قيد التحضير','Preparing','En préparation'),ready:L('جاهز','Ready','Prêt'),completed:L('مكتمل','Completed','Terminé'),delivered:L('تم التوصيل','Delivered','Livré'),cancelled:L('ملغي','Cancelled','Annulé'),canceled:L('ملغي','Canceled','Annulé')};return labels[status]||status};
 const sourceText=(source:string)=>{const labels:Record<string,string>={menu:L('المنيو','Menu','Menu'),pos:L('نقطة البيع','POS','Point de vente'),reservation:L('حجز','Reservation','Réservation'),room_service:L('خدمة الغرف','Room service','Service en chambre'),takeaway:L('استلام','Takeaway','À emporter'),delivery:L('توصيل','Delivery','Livraison')};return labels[source]||source.replace(/[_-]+/g,' ')};
 const planName=p.subscription?(ar?p.subscription.nameAr||p.subscription.nameEn:p.subscription.nameEn||p.subscription.nameAr):'';
 return <div className="restaurant-v2-workspace">
  <section className="restaurant-v2-page-heading">
   <div><span className="restaurant-v2-eyebrow">{L('مركز تشغيل المطعم','Restaurant operations','Opérations du restaurant')}</span><h1>{L('ملخص اليوم','Today at a glance','Résumé du jour')}</h1><p>{L('تابع الطلبات والمبيعات والحجوزات من مكان واحد.','Keep orders, sales and reservations in one place.','Suivez les commandes, ventes et réservations au même endroit.')}</p></div>
   <span className={'restaurant-v2-tenant-status status-'+p.status}>{statusText(p.status)}</span>
  </section>
  <section className="restaurant-v2-kpis" aria-label={L('مؤشرات التشغيل','Operations metrics','Indicateurs')}>
   <article><span><ShoppingCart/></span><div><small>{L('طلبات تحتاج متابعة','Orders to handle','Commandes à traiter')}</small><b>{pending}</b></div><Link href={base+'/orders'} aria-label={L('فتح الطلبات','Open orders','Ouvrir les commandes')}>›</Link></article>
   <article><span><TrendingUp/></span><div><small>{L('المبيعات المكتملة','Completed sales','Ventes terminées')}</small><b>{money(p.revenue)}</b><small>{p.completedSales} {L('عملية مكتملة','completed sales','ventes terminées')}</small></div></article>
   <article><span><UtensilsCrossed/></span><div><small>{L('أصناف المنيو','Menu items','Articles du menu')}</small><b>{p.itemCount}</b><small>{p.categoryCount} {L('قسم','categories','catégories')}</small></div></article>
   <article><span><CalendarDays/></span><div><small>{L('حجوزات مؤكدة ومعلقة','Pending and confirmed reservations','Réservations en attente et confirmées')}</small><b>{p.reservationsCount===null?'—':p.reservationsCount}</b></div><Link href={base+'/reservations'} aria-label={L('فتح الحجوزات','Open reservations','Ouvrir les réservations')}>›</Link></article>
  </section>
  <section className="restaurant-v2-actions" aria-label={L('اختصارات التشغيل','Operations shortcuts','Raccourcis')}>
   <Link href={base+'/orders'}><ClipboardList/><div><b>{L('الطلبات المباشرة','Live orders','Commandes')}</b><small>{pending} {L('تحتاج متابعة','need attention','à traiter')}</small></div><strong>›</strong></Link>
   <Link href={base+'/reservations'}><CalendarDays/><div><b>{L('الحجوزات والانتظار','Reservations & waitlist','Réservations et attente')}</b><small>{L('إدارة المقاعد والدور','Manage seating and queue','Gérer les places')}</small></div><strong>›</strong></Link>
   <Link href={base+'/kds'}><ChefHat/><div><b>{L('المطبخ KDS','Kitchen KDS','Cuisine KDS')}</b><small>{L('متابعة تجهيز الطلبات','Track order preparation','Suivre la préparation')}</small></div><strong>›</strong></Link>
  </section>
  <div className="restaurant-v2-grid">
   <section className="restaurant-v2-primary">
    <article className="restaurant-v2-card restaurant-v2-chart">
     <header><div><small>{L('المبيعات المكتملة','Completed sales','Ventes terminées')}</small><h2>{L('اتجاه المبيعات','Sales trend','Tendance des ventes')}</h2></div><b>{money(p.revenue)}</b></header>
     {p.monthlySales.length?<div className="restaurant-v2-bars" role="img" aria-label={L('المبيعات الشهرية','Monthly sales','Ventes mensuelles')}>{p.monthlySales.slice(-12).map(sale=>{const value=Number(sale.total);const month=String(sale.month).padStart(2,'0');return <div key={String(sale.year)+'-'+month} title={money(value)}><i style={{height:Math.max(5,value/max*100)+'%'}}/><small>{month}</small></div>})}</div>:<div className="restaurant-v2-empty">{L('ستظهر بيانات المبيعات هنا عند تسجيل عمليات مكتملة.','Sales data will appear here after completed transactions.','Les ventes apparaîtront après les premières transactions terminées.')}</div>}
    </article>
    <article className="restaurant-v2-card">
     <header><div><small>{L('التشغيل الآن','Live operations','Opérations')}</small><h2>{L('حالة الطلبات','Order status','Statut des commandes')}</h2></div><Link href={base+'/orders'}>{L('فتح الطلبات','Open orders','Ouvrir')}</Link></header>
     <div className="restaurant-v2-status"><div><b>{pending}</b><small>{L('تحتاج متابعة','Needs attention','À traiter')}</small></div><div><b>{completed}</b><small>{L('مكتمل','Completed','Terminées')}</small></div><div><b>{delivered}</b><small>{L('تم التوصيل','Delivered','Livrées')}</small></div><div><b>{cancelled}</b><small>{L('ملغي','Cancelled','Annulées')}</small></div></div>
    </article>
    <article className="restaurant-v2-card">
     <header><div><small>{L('آخر النشاط','Latest activity','Activité récente')}</small><h2>{L('آخر الطلبات','Recent orders','Commandes récentes')}</h2></div><Link href={base+'/orders'}>{L('عرض الكل','View all','Tout voir')}</Link></header>
     {p.recentOrders.length?<div className="restaurant-v2-orders">{p.recentOrders.map(order=><div key={order.id}><span><b>{order.reference}</b><small>{order.customer_name||sourceText(order.source)} · {orderStatusText(order.status)}</small></span><strong>{money(Number(order.total))}</strong></div>)}</div>:<div className="restaurant-v2-empty">{L('لا توجد طلبات حديثة.','No recent orders.','Aucune commande récente.')}</div>}
    </article>
   </section>
   <aside className="restaurant-v2-secondary">
    <article className="restaurant-v2-card restaurant-v2-menu-summary"><header><div><small>{L('إدارة المحتوى','Content management','Gestion du contenu')}</small><h2>{L('المنيو','Menu','Menu')}</h2></div><Link href={base+'/menu'}>{L('إدارة','Manage','Gérer')}</Link></header><div><span><b>{p.itemCount}</b><small>{L('صنف','Items','Articles')}</small></span><span><b>{p.categoryCount}</b><small>{L('قسم','Categories','Catégories')}</small></span></div></article>
    <article className="restaurant-v2-card restaurant-v2-sources"><header><div><small>{L('قنوات البيع','Sales channels','Canaux de vente')}</small><h2>{L('مصادر الطلبات المكتملة','Completed order sources','Origine des commandes')}</h2></div></header>{p.sourceSales.length?<div>{p.sourceSales.map(source=><div key={source.source}><span>{sourceText(source.source)} <small>{source.count}</small></span><b>{money(Number(source.total))}</b></div>)}</div>:<div className="restaurant-v2-empty compact">{L('لا توجد عمليات مكتملة بعد.','No completed transactions yet.','Aucune transaction terminée.')}</div>}</article>
    <article className="restaurant-v2-card restaurant-v2-plan"><header><div><small>{L('الحساب','Account','Compte')}</small><h2>{L('الباقة','Plan','Forfait')}</h2></div><PackageOpen/></header>{p.subscription?<><b>{planName}</b><small>{statusText(p.subscription.status)} · {p.subscription.enabledFeatures}/{p.subscription.totalFeatures} {L('خصائص مفعلة','features enabled','fonctionnalités actives')}</small></>:<small>{L('لا يوجد اشتراك مرتبط','No linked subscription','Aucun abonnement')}</small>}</article>
   </aside>
  </div>
 </div>
}
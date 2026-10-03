'use client';

import Link from 'next/link';
import {
  CalendarDays,
  ChefHat,
  ClipboardList,
  Eye ,
  PackageOpen,
  Share2,
  ShoppingCart,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { usePreferences } from '@/components/platform/preferences';

type Order = {
  id: string;
  reference: string;
  source: string;
  status: string;
  customer_name?: string | null;
  total: number | string;
  currency: string;
  created_at: number;
};
type Sub = {
  planId: string;
  status: string;
  nameAr: string;
  nameEn: string;
  startsAt: number | null;
  expiresAt: number | null;
  enabledFeatures: number;
  totalFeatures: number;
};
type SaleSource = { source: string; count: number | string; total: number | string };
type MonthSale = { year: number | string; month: number | string; total: number | string };
type Props = {
  sourceSales: SaleSource[];
  monthlySales: MonthSale[];
  slug: string;
  name: string;
  status: string;
  currency: string;
  categoryCount: number;
  itemCount: number;
  orderCount: number;
  revenue: number;
  completedSales: number;
  orderStatuses: Record<string, number>;
  recentOrders: Order[];
  subscription: Sub | null;
};

export default function RestaurantDashboard(p: Props) {
  const { locale } = usePreferences();
  const ar = locale === 'ar';
  const L = (a: string, e: string, f = e) => (ar ? a : locale === 'fr' ? f : e);
  const base = '/restaurant/' + encodeURIComponent(p.slug);
  const money = (n: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: p.currency || 'SAR',
  }).format(n);
  const count = (...keys: string[]) => keys.reduce((n, key) => n + (p.orderStatuses[key] || 0), 0);
  const pending = count('new', 'pending', 'confirmed', 'preparing');
  const completed = count('completed');
  const delivered = count('delivered');
  const cancelled = count('cancelled', 'canceled');
  const maxMonthlySales = Math.max(...p.monthlySales.map((sale) => Number(sale.total)), 1);

  return (
    <div className="restaurant-ops restaurant-reference-dashboard">
      <section className="restaurant-stat-grid restaurant-reference-stats" aria-label={L('ملخص المطعم', 'Restaurant summary', 'Résumé du restaurant')}>
        <article><span><UtensilsCrossed /></span><div><strong>{p.itemCount}</strong><small>{L('إجمالي الأصناف', 'Total items', 'Total articles')}</small></div></article>
        <article><span><ShoppingCart /></span><div><strong>{p.orderCount}</strong><small>{L('إجمالي الطلبات', 'Total orders', 'Total commandes')}</small></div></article>
        <article><span><Eye /></span><div><strong>—</strong><small>{L('مشاهدات الملف', 'Profile views', 'Vues du profil')}</small></div></article>
        <article><span><Share2 /></span><div><strong>—</strong><small>{L('المشاركات', 'Shares', 'Partages')}</small></div></article>
      </section>

      <div className="restaurant-dashboard-grid">
        <section className="restaurant-dashboard-main">
          <div className="restaurant-profile-grid">
            <article className="records-card restaurant-profile-card">
              <div className="restaurant-profile-counts">
                <span><UtensilsCrossed /> {L('المنيو', 'Menu', 'Menu')} <b>{p.itemCount}</b></span>
                <span><PackageOpen /> {L('الأقسام', 'Categories', 'Catégories')} <b>{p.categoryCount}</b></span>
                <span><Star /> {L('الخصائص', 'Features', 'Fonctionnalités')} <b>{p.subscription ? `${p.subscription.enabledFeatures} / ${p.subscription.totalFeatures}` : '—'}</b></span>
                <span><ClipboardList /> {L('الطلبات', 'Orders', 'Commandes')} <b>{p.orderCount}</b></span>
              </div>
            </article>

            <article className="records-card restaurant-plan-card">
              <h2>{L('الاشتراك والباقة', 'Subscription & plan', 'Abonnement et forfait')}</h2>
              {p.subscription ? <>
                <strong>{p.subscription.nameAr || p.subscription.nameEn}</strong>
                <span className="restaurant-plan-status">{p.subscription.status}</span>
                <span>{p.subscription.totalFeatures > 0
                  ? `${p.subscription.enabledFeatures} / ${p.subscription.totalFeatures} ${L('خصائص', 'features', 'fonctionnalités')}`
                  : L('لا توجد خصائص معرفة للباقة', 'No plan features defined', 'Aucune fonctionnalité définie')}</span>
                {p.subscription.expiresAt && <small>{L('ينتهي', 'Expires', 'Expire')}: {new Date(p.subscription.expiresAt).toLocaleDateString(ar ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US')}</small>}
              </> : <p>{L('لا يوجد اشتراك مرتبط.', 'No linked subscription.', 'Aucun abonnement associé.')}</p>}
            </article>
          </div>

          <article className="records-card">
            <h2>{L('إجمالي المبيعات', 'Total sales', 'Ventes totales')}</h2>
            <div className="restaurant-sales-summary">
              <div><strong>{money(p.revenue)}</strong><small>{L('إجمالي المبيعات المكتملة', 'Completed sales total', 'Total des ventes terminées')}</small></div>
              <div><strong>{p.completedSales}</strong><small>{L('عدد عمليات البيع المكتملة', 'Completed sales count', 'Nombre de ventes terminées')}</small></div>
              {p.sourceSales.map((sale) => <div key={sale.source}><strong>{money(Number(sale.total))}</strong><small>{sale.source} ({Number(sale.count)})</small></div>)}
            </div>
          </article>

          <article className="records-card">
            <div className="restaurant-card-head">
              <div><h2>{L('آخر الطلبات', 'Recent orders', 'Commandes récentes')}</h2><small>{p.recentOrders.length} {L('طلبات', 'orders', 'commandes')}</small></div>
              <Link className="restaurant-dashboard-view-all" href={base + '/orders'}>{L('عرض الكل', 'View all', 'Tout voir')} <span aria-hidden="true">›</span></Link>
            </div>
            {p.recentOrders.length ? <div className="review-list">
              {p.recentOrders.map((order) => <div className="restaurant-record-row" key={order.id}>
                <span><strong>{order.reference}</strong><small>{order.customer_name || order.source} · {order.status}</small></span>
                <b>{money(Number(order.total))}</b>
              </div>)}
            </div> : <p>{L('لا توجد طلبات حديثة.', 'No recent orders.', 'Aucune commande récente.')}</p>}
          </article>
        </section>

        <aside className="restaurant-dashboard-side">
          <article className="records-card">
            <h2>{L('رسم المبيعات', 'Sales graph', 'Graphique des ventes')}</h2>
            {p.monthlySales.length ? <div className="restaurant-sales-bars">
              {p.monthlySales.slice(-12).map((sale) => {
                const value = Number(sale.total);
                return <div key={`${sale.year}-${sale.month}`} title={money(value)} aria-label={money(value)}>
                  <i style={{ height: `${Math.max(4, value / maxMonthlySales * 100)}%` }} />
                  <small>{String(sale.month).padStart(2, '0')}/{String(sale.year).slice(-2)}</small>
                </div>;
              })}
            </div> : <p>{L('لا توجد مبيعات للرسم بعد.', 'No sales data to chart yet.', 'Aucune vente à afficher.')}</p>}
          </article>

          <article className="records-card">
            <h2>{L('حالة الطلبات', 'Order status', 'Statut des commandes')}</h2>
            <div className="restaurant-order-status-grid">
              <div><b>{pending}</b><small>{L('قيد التنفيذ', 'Pending', 'En attente')}</small></div>
              <div><b>{completed}</b><small>{L('مكتمل', 'Completed', 'Terminées')}</small></div>
              <div><b>{delivered}</b><small>{L('تم التوصيل', 'Delivered', 'Livrées')}</small></div>
              <div><b>{cancelled}</b><small>{L('ملغي', 'Cancelled', 'Annulées')}</small></div>
            </div>
          </article>

          <article className="records-card">
            <h2>{L('إجراءات سريعة', 'Quick actions', 'Actions rapides')}</h2>
            <div className="restaurant-quick-actions">
              <Link href={base + '/menu'}><span><UtensilsCrossed /></span>{L('إدارة المنيو', 'Manage menu', 'Gérer le menu')}</Link>
              <Link href={base + '/orders'}><span><ClipboardList /></span>{L('الطلبات المباشرة', 'Live orders', 'Commandes directes')}</Link>
              <Link href={base + '/reservations'}><span><CalendarDays /></span>{L('الحجوزات', 'Reservations', 'Réservations')}</Link>
              <Link href={base + '/kds'}><span><ChefHat /></span>KDS</Link>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import {usePreferences} from '@/components/platform/preferences';

type ModuleKey='inventory'|'customers'|'reports'|'staff'|'promo'|'payment-history'|'subscription'|'restaurant-settings'|'whatsapp';
const modules:Record<ModuleKey,{ar:string;en:string;fr:string;items:[string,string,string][]}>={
 inventory:{ar:'المخزون والمشتريات',en:'Inventory & purchasing',fr:'Stock et achats',items:[['المواد والمخزون','Stock items','Articles en stock'],['الموردون والمشتريات','Suppliers & purchases','Fournisseurs et achats'],['الجرد والحركات','Stock counts & movements','Inventaire et mouvements']]},
 customers:{ar:'العملاء',en:'Customers',fr:'Clients',items:[['دليل العملاء','Customer directory','Répertoire clients'],['الطلبات والحجوزات','Orders & reservations','Commandes et réservations'],['الملاحظات والولاء','Notes & loyalty','Notes et fidélité']]},
 reports:{ar:'التقارير والمالية',en:'Reports & finance',fr:'Rapports et finance',items:[['المبيعات والطلبات','Sales & orders','Ventes et commandes'],['الضرائب والإيرادات','Tax & revenue','Taxes et revenus'],['التقارير التشغيلية','Operational reports','Rapports opérationnels']]},
 staff:{ar:'الموظفون والصلاحيات',en:'Staff & permissions',fr:'Personnel et permissions',items:[['الموظفون','Employees','Employés'],['الأدوار والصلاحيات','Roles & permissions','Rôles et permissions'],['الحضور وسجل الإجراءات','Attendance & audit','Présence et audit']]},
 promo:{ar:'العروض والترويج',en:'Offers & promotion',fr:'Offres et promotion',items:[['العروض والخصومات','Offers & discounts','Offres et remises'],['القسائم','Coupons','Coupons'],['الحملات','Campaigns','Campagnes']]},
 'payment-history':{ar:'المدفوعات والفواتير',en:'Payments & invoices',fr:'Paiements et factures',items:[['سجل المدفوعات','Payment history','Historique des paiements'],['الفواتير','Invoices','Factures'],['طرق الدفع','Payment methods','Modes de paiement']]},
 subscription:{ar:'الباقة',en:'Plan',fr:'Forfait',items:[['الباقة الحالية','Current plan','Forfait actuel'],['الميزات والحدود','Features & limits','Fonctions et limites'],['الترقية والتجديد','Upgrade & renewal','Mise à niveau et renouvellement']]},
 'restaurant-settings':{ar:'إعداد المطعم والطباعة وQR',en:'Restaurant, printing & QR',fr:'Restaurant, impression et QR',items:[['بيانات المطعم والفروع','Restaurant & branches','Restaurant et succursales'],['الطابعات والأقسام','Printers & stations','Imprimantes et postes'],['QR والخدمات','QR & services','QR et services']]},
 whatsapp:{ar:'WhatsApp والإشعارات',en:'WhatsApp & notifications',fr:'WhatsApp et notifications',items:[['قنوات الإشعارات','Notification channels','Canaux de notification'],['قوالب الرسائل','Message templates','Modèles de messages'],['إعداد WhatsApp','WhatsApp setup','Configuration WhatsApp']]}
};
export default function RestaurantModule({slug,module}:{slug:string;module:ModuleKey}){
 const {locale}=usePreferences();const x=modules[module];const title=locale==='ar'?x.ar:locale==='fr'?x.fr:x.en;
 return <div className="restaurant-v2-workspace"><section className="restaurant-v2-card"><header><div><small>FOON</small><h2>{title}</h2></div></header><div className="restaurant-v2-actions">{x.items.map((i,n)=><article key={n}><div><b>{locale==='ar'?i[0]:locale==='fr'?i[2]:i[1]}</b><small>{locale==='ar'?'تم وضع هذه الوظيفة داخل قسمها التشغيلي الصحيح.':locale==='fr'?'Fonction organisée dans son domaine opérationnel.':'Organized under its correct operational domain.'}</small></div></article>)}</div><Link href={'/restaurant/'+encodeURIComponent(slug)}>{locale==='ar'?'العودة للرئيسية':locale==='fr'?'Retour':'Back to overview'}</Link></section></div>
}

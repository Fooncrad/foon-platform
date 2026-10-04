'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {BarChart3,BookOpen,Brush,CalendarDays,ClipboardList,ContactRound,CreditCard,Eye,Languages,LayoutDashboard,Menu,MessageSquare,Moon,PackageOpen,Settings2,Share2,ShoppingCart,Sun,UsersRound,Warehouse,X} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';

type Props={slug:string;name:string;children:React.ReactNode};
type Item={key:string;ar:string;en:string;fr:string;icon:typeof Menu};
const groups:{ar:string;en:string;fr:string;items:Item[]}[]=[
 {ar:'التشغيل',en:'Operations',fr:'Opérations',items:[{key:'overview',ar:'الرئيسية',en:'Overview',fr:'Vue générale',icon:LayoutDashboard},{key:'orders',ar:'الطلبات',en:'Orders',fr:'Commandes',icon:ClipboardList},{key:'reservations',ar:'الحجوزات والانتظار',en:'Reservations & waitlist',fr:'Réservations et attente',icon:CalendarDays},{key:'kds',ar:'المطبخ KDS',en:'Kitchen KDS',fr:'Cuisine KDS',icon:ClipboardList},{key:'pos',ar:'نقطة البيع',en:'Point of sale',fr:'Point de vente',icon:ShoppingCart}]},
 {ar:'الإدارة',en:'Management',fr:'Gestion',items:[{key:'menu',ar:'المنيو والأصناف',en:'Menu & items',fr:'Menu et articles',icon:BookOpen},{key:'inventory',ar:'المخزون والمشتريات',en:'Inventory & purchasing',fr:'Stock et achats',icon:Warehouse},{key:'customers',ar:'العملاء',en:'Customers',fr:'Clients',icon:ContactRound},{key:'reports',ar:'التقارير والمالية',en:'Reports & finance',fr:'Rapports et finances',icon:BarChart3},{key:'staff',ar:'الموظفون والصلاحيات',en:'Staff & permissions',fr:'Équipe et accès',icon:UsersRound}]},
 {ar:'النمو والإعداد',en:'Growth & setup',fr:'Croissance et réglages',items:[{key:'brand-theme',ar:'الهوية والسمات',en:'Brand & themes',fr:'Identité et thèmes',icon:Brush},{key:'promo',ar:'العروض والترويج',en:'Offers & promotion',fr:'Offres et promotion',icon:Share2},{key:'payment-history',ar:'المدفوعات والفواتير',en:'Payments & invoices',fr:'Paiements et factures',icon:CreditCard},{key:'subscription',ar:'الباقة',en:'Plan',fr:'Forfait',icon:PackageOpen},{key:'restaurant-settings',ar:'إعداد المطعم والطباعة وQR',en:'Restaurant, printing & QR',fr:'Restaurant, impression et QR',icon:Settings2},{key:'whatsapp',ar:'WhatsApp والإشعارات',en:'WhatsApp & notifications',fr:'WhatsApp et notifications',icon:MessageSquare}]}
];

export default function RestaurantShell({slug,name,children}:Props){
 const {locale,setLocale,dark,toggleTheme}=usePreferences();
 const pathname=usePathname();
 const [open,setOpen]=useState(false);
 const base='/restaurant/'+encodeURIComponent(slug);
 const rtl=locale==='ar';
 const L=(a:string,e:string,f:string)=>rtl?a:locale==='fr'?f:e;
 const current=groups.flatMap(group=>group.items).find(item=>item.key==='overview'?pathname===base:pathname===base+'/'+item.key||pathname.startsWith(base+'/'+item.key+'/'));
 useEffect(()=>{setOpen(false)},[pathname]);
 useEffect(()=>{
  if(!open)return;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const esc=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};
  window.addEventListener('keydown',esc);
  return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',esc)};
 },[open]);
 return <div className="restaurant-v2-shell" dir={rtl?'rtl':'ltr'}>
  <aside className={'restaurant-v2-sidebar '+(open?'is-open':'')} aria-hidden={!open?undefined:undefined} aria-label={L('قائمة المطعم','Restaurant navigation','Navigation du restaurant')}>
   <div className="restaurant-v2-brand"><div><b>FOON<span>.</span></b><small title={name}>{name}</small></div><button type="button" className="restaurant-v2-mobile-close" onClick={event=>{event.stopPropagation();setOpen(false)}} aria-label={L('إغلاق القائمة','Close navigation','Fermer la navigation')}><X/></button></div>
   <nav id="restaurant-navigation">{groups.map(group=><section key={group.en}><label>{locale==='fr'?group.fr:rtl?group.ar:group.en}</label>{group.items.map(({key,ar,en,fr,icon:Icon})=>{const href=key==='overview'?base:base+'/'+key;const active=key==='overview'?pathname===base:pathname===href||pathname.startsWith(href+'/');const label=locale==='fr'?fr:rtl?ar:en;return <Link key={key} href={href} className={active?'active':''} title={label} aria-current={active?'page':undefined} onClick={()=>setOpen(false)} onNavigate={()=>setOpen(false)}><Icon/><span>{label}</span></Link>})}</section>)}</nav>
   <footer><label><Languages/><span>{L('اللغة','Language','Langue')}</span><select aria-label={L('اختيار اللغة','Choose language','Choisir la langue')} value={locale} onChange={event=>setLocale(event.target.value as 'ar'|'en'|'fr')}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select></label><Link href={'/menu/'+encodeURIComponent(slug)} target="_blank" rel="noreferrer"><BookOpen/><span>{L('فتح المنيو','Open menu','Ouvrir le menu')}</span></Link></footer>
  </aside>
  <main className="restaurant-v2-main" id="restaurant-main">
   <header className="restaurant-v2-topbar"><button type="button" className="restaurant-v2-menu" onClick={()=>setOpen(true)} aria-expanded={open} aria-controls="restaurant-navigation" aria-label={L('فتح القائمة','Open navigation','Ouvrir la navigation')}><Menu/></button><div className="restaurant-v2-title"><b>{current?(locale==='fr'?current.fr:rtl?current.ar:current.en):L('مركز التشغيل','Operations','Opérations')}</b><small>{name}</small></div><Link className="restaurant-v2-store" href={'/menu/'+encodeURIComponent(slug)} target="_blank" rel="noreferrer"><Eye/><span>{L('عرض المتجر','View shop','Voir le restaurant')}</span></Link><div className="restaurant-v2-tools"><button type="button" onClick={toggleTheme} aria-label={dark?L('الوضع النهاري','Light mode','Mode clair'):L('الوضع الليلي','Dark mode','Mode sombre')}>{dark?<Sun/>:<Moon/>}</button></div></header>
   {children}
  </main>
  {open&&<button type="button" className="restaurant-v2-backdrop" onClick={()=>setOpen(false)} aria-label={L('إغلاق القائمة','Close navigation','Fermer la navigation')}/>}
 </div>
}
'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {BarChart3,BookOpen,CalendarDays,ChevronLeft,ClipboardList,ContactRound,CreditCard,Eye,Languages,LayoutDashboard,Menu,MessageSquare,Moon,PackageOpen,Settings2,Share2,ShoppingCart,Star,Sun,UsersRound,Warehouse,X} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';

type Props={slug:string;name:string;children:React.ReactNode};
type Item={key:string;ar:string;en:string;icon:typeof Menu;ready?:boolean};
const groups:{ar:string;en:string;items:Item[]}[]=[
 {ar:'التشغيل',en:'Operations',items:[{key:'overview',ar:'الرئيسية',en:'Overview',icon:LayoutDashboard,ready:true},{key:'orders',ar:'الطلبات',en:'Orders',icon:ClipboardList,ready:true},{key:'reservations',ar:'الحجوزات والانتظار',en:'Reservations & waitlist',icon:CalendarDays,ready:true},{key:'kds',ar:'المطبخ KDS',en:'Kitchen KDS',icon:ClipboardList,ready:true},{key:'pos',ar:'نقطة البيع',en:'Point of sale',icon:ShoppingCart,ready:true}]},
 {ar:'الإدارة',en:'Management',items:[{key:'menu',ar:'المنيو والأصناف',en:'Menu & items',icon:BookOpen,ready:true},{key:'inventory',ar:'المخزون والمشتريات',en:'Inventory & purchasing',icon:Warehouse,ready:true},{key:'customers',ar:'العملاء',en:'Customers',icon:ContactRound,ready:true},{key:'reports',ar:'التقارير والمالية',en:'Reports & finance',icon:BarChart3,ready:true},{key:'staff',ar:'الموظفون والصلاحيات',en:'Staff & permissions',icon:UsersRound,ready:true}]},
 {ar:'النمو والإعداد',en:'Growth & setup',items:[{key:'promo',ar:'العروض والترويج',en:'Offers & promotion',icon:Share2,ready:true},{key:'payment-history',ar:'المدفوعات والفواتير',en:'Payments & invoices',icon:CreditCard,ready:true},{key:'subscription',ar:'الباقة',en:'Plan',icon:PackageOpen,ready:true},{key:'restaurant-settings',ar:'إعداد المطعم والطباعة وQR',en:'Restaurant, printing & QR',icon:Settings2,ready:true},{key:'whatsapp',ar:'WhatsApp والإشعارات',en:'WhatsApp & notifications',icon:MessageSquare,ready:true}]}
];

export default function RestaurantShell({slug,name,children}:Props){
 const {locale,setLocale,dark,toggleTheme}=usePreferences();
 const pathname=usePathname(); const [open,setOpen]=useState(false); const [collapsed,setCollapsed]=useState(false); const touchStartX=useRef<number|null>(null); const touchStartY=useRef<number|null>(null);
 const base='/restaurant/'+encodeURIComponent(slug),rtl=locale==='ar';
 const L=(a:string,e:string,f:string)=>rtl?a:locale==='fr'?f:e;
 useEffect(()=>{try{setCollapsed(localStorage.getItem('foon.restaurant.sidebar')==='collapsed')}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('foon.restaurant.sidebar',collapsed?'collapsed':'expanded')}catch{}},[collapsed]);
 useEffect(()=>{if(!open)return;const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[open]);
 return <div className={'restaurant-v2-shell '+(collapsed?'is-collapsed':'')} dir={rtl?'rtl':'ltr'}>
  <aside className={'restaurant-v2-sidebar '+(open?'is-open':'')} onTouchStart={e=>{touchStartX.current=e.changedTouches[0]?.clientX??null;touchStartY.current=e.changedTouches[0]?.clientY??null}} onTouchEnd={e=>{const startX=touchStartX.current,startY=touchStartY.current;touchStartX.current=null;touchStartY.current=null;if(startX===null||startY===null)return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(dx>56&&dx>Math.abs(dy)*1.2)setOpen(false)}}>
   <div className="restaurant-v2-brand"><div><b>FOON<span>.</span></b><small>{name}</small></div><button type="button" className="restaurant-v2-mobile-close" onClick={()=>setOpen(false)} aria-label={L('إغلاق','Close','Fermer')}><X/></button></div>
   <nav>{groups.map(g=><section key={g.en}><label>{rtl?g.ar:g.en}</label>{g.items.map(({key,ar,en,icon:Icon,ready})=>{const href=key==='overview'?base:base+'/'+key;const active=key==='overview'?pathname===base:pathname.startsWith(href);return ready?<Link key={key} href={href} className={active?'active':''} title={rtl?ar:en} onClick={()=>setOpen(false)}><Icon/><span>{rtl?ar:en}</span></Link>:<span key={key} className="pending" title={L('قيد التجهيز','Coming soon','Bientôt')}><Icon/><span>{rtl?ar:en}</span></span>})}</section>)}</nav>
   <footer><label><Languages/><span>{L('اللغة','Language','Langue')}</span><select value={locale} onChange={e=>setLocale(e.target.value as 'ar'|'en'|'fr')}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select></label><Link href={'/menu/'+encodeURIComponent(slug)}><BookOpen/><span>{L('فتح المنيو','Open menu','Ouvrir le menu')}</span></Link></footer>
  </aside>
  <button type="button" className="restaurant-v2-collapse" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?L('توسيع القائمة','Expand sidebar','Développer le menu'):L('طي القائمة','Collapse sidebar','Réduire le menu')}><ChevronLeft/></button>
  <main className="restaurant-v2-main">
   <header className="restaurant-v2-topbar"><button type="button" className="restaurant-v2-menu" onClick={()=>setOpen(true)} aria-label={L('فتح القائمة','Open menu','Ouvrir le menu')}><Menu/></button><div className="restaurant-v2-title"><b>{L('مركز التشغيل','Operations','Opérations')}</b><small>{name}</small></div><Link className="restaurant-v2-store" href={'/menu/'+encodeURIComponent(slug)} target="_blank"><Eye/>{L('عرض المتجر','View shop','Voir le restaurant')}</Link><div className="restaurant-v2-tools"><button type="button" onClick={toggleTheme} aria-label={dark?L('الوضع النهاري','Light mode','Mode clair'):L('الوضع الليلي','Dark mode','Mode sombre')}>{dark?<Sun/>:<Moon/>}</button><button type="button" className="restaurant-v2-bell" aria-label={L('الإشعارات','Notifications','Notifications')}><span/></button></div></header>
   {children}
  </main>
  {open&&<button type="button" className="restaurant-v2-backdrop" onClick={()=>setOpen(false)} aria-label={L('إغلاق القائمة','Close menu','Fermer le menu')}/>}
 </div>
}

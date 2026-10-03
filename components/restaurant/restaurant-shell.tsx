'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {BarChart3,BookOpen,CalendarDays,ChevronLeft,ClipboardList,Hotel,LayoutDashboard,Menu,PackageOpen,QrCode,Settings2,ShoppingCart,UsersRound,Warehouse,X} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';

type Props={slug:string;name:string;children:React.ReactNode};
const modules=[
 ['overview','نظرة عامة','Overview',LayoutDashboard,true],
 ['menu','المنيو والأصناف','Menu & items',BookOpen,true],
 ['orders','الطلبات','Orders',ClipboardList,false],
 ['pos','نقاط البيع','POS',ShoppingCart,false],
 ['tables','الطاولات والحجوزات','Tables & reservations',CalendarDays,false],
 ['queue','قائمة الانتظار','Queue',UsersRound,false],
 ['room-service','خدمة الغرف','Room service',Hotel,false],
 ['inventory','المخزون والمشتريات','Inventory',Warehouse,false],
 ['staff','الموظفون والصلاحيات','Staff & permissions',UsersRound,false],
 ['reports','التقارير والتحليلات','Reports & analytics',BarChart3,false],
 ['qr','QR والطاولات','QR & tables',QrCode,false],
 ['settings','إعدادات المطعم','Restaurant settings',Settings2,false],
] as const;

export default function RestaurantShell({slug,name,children}:Props){
 const {locale}=usePreferences();const pathname=usePathname();const [open,setOpen]=useState(false);const base='/restaurant/'+encodeURIComponent(slug);
 const rtl=locale==='ar';
 return <div className="restaurant-shell" dir={rtl?'rtl':'ltr'}>
  <aside className={'restaurant-sidebar '+(open?'is-open':'')}>
   <div className="restaurant-sidebar-brand"><div><strong>FOON.</strong><small>{name}</small></div><button onClick={()=>setOpen(false)} aria-label="Close"><X/></button></div>
   <nav>{modules.map(([key,ar,en,Icon,ready])=>{const label=rtl?ar:en;const href=key==='overview'?base:base+'/'+key;const active=key==='overview'?pathname===base:pathname.startsWith(href);return ready?<Link key={key} href={href} className={active?'active':''} onClick={()=>setOpen(false)}><Icon/><span>{label}</span><ChevronLeft/></Link>:<span key={key} className="restaurant-nav-pending"><Icon/><span>{label}</span></span>})}</nav>
   <div className="restaurant-sidebar-foot"><Link href={'/menu/'+encodeURIComponent(slug)} target="_blank"><BookOpen/>{rtl?'فتح منيو المطعم':'Open restaurant menu'}</Link><Link href={'/store/subscription?tenant='} className="restaurant-nav-muted" aria-disabled="true"><PackageOpen/>{rtl?'الباقة والخصائص':'Plan & features'}</Link></div>
  </aside>
  <div className="restaurant-main"><header className="restaurant-topbar"><button className="restaurant-mobile-menu" onClick={()=>setOpen(true)} aria-label="Menu"><Menu/></button><div><strong>{name}</strong><small>{rtl?'إدارة وتشغيل المطعم':'Restaurant operations'}</small></div><Link href={base}>{rtl?'مركز التشغيل':'Operations'}</Link></header>{children}</div>
  {open&&<button className="restaurant-sidebar-backdrop" aria-label="Close" onClick={()=>setOpen(false)}/>}
 </div>
}

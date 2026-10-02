import Link from 'next/link';
import {BookOpen,ClipboardList,LayoutDashboard,MonitorSmartphone,ShoppingCart,Store,UsersRound,UtensilsCrossed} from 'lucide-react';

type Props={slug:string;name:string;status:string;currency:string;categoryCount:number;itemCount:number;orderCount:number;openOrderCount:number};
export default function RestaurantDashboard(p:Props){
 const base='/restaurant/'+encodeURIComponent(p.slug);
 const cards=[
  ['الأقسام',p.categoryCount,BookOpen],['الأصناف',p.itemCount,UtensilsCrossed],['إجمالي الطلبات',p.orderCount,ClipboardList],['طلبات مفتوحة',p.openOrderCount,ShoppingCart]
 ] as const;
 const tools=[
  ['المنيو والأصناف','إدارة الأقسام والأسعار والصور',base+'/menu',BookOpen],
  ['الطلبات','متابعة الطلبات وحالات التنفيذ',base+'/orders',ClipboardList],
  ['نقاط البيع POS','الكاشير والطلبات المباشرة',base+'/pos',MonitorSmartphone],
  ['الطاولات والحجوزات','إدارة الصالة والحجوزات',base+'/tables',UsersRound]
 ] as const;
 return <div className="restaurant-ops" dir="rtl">
  <div className="restaurant-ops-head"><div><span className="restaurant-ops-kicker"><LayoutDashboard size={16}/> مركز التشغيل</span><h1>{p.name}</h1><p>إدارة المطعم والطلبات والمنيو من مساحة تشغيل واحدة.</p></div><div className="restaurant-ops-actions"><span className={'restaurant-status '+p.status}>{p.status==='active'?'نشط':p.status}</span><Link href={'/menu/'+encodeURIComponent(p.slug)} target="_blank"><Store size={17}/> فتح المنيو</Link></div></div>
  <section className="restaurant-stat-grid">{cards.map(([label,value,Icon])=><article key={label}><span><Icon size={19}/></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</section>
  <section className="restaurant-tool-section"><div className="restaurant-section-title"><div><h2>أدوات المطعم</h2><p>الأقسام التشغيلية مرتبطة بهذا المطعم فقط.</p></div></div><div className="restaurant-tool-grid">{tools.map(([title,desc,href,Icon])=><Link href={href} key={title}><span><Icon size={22}/></span><div><strong>{title}</strong><small>{desc}</small></div><b>←</b></Link>)}</div></section>
  <footer className="restaurant-ops-foot"><span>مسار المتجر</span><code dir="ltr">/restaurant/{p.slug}</code><span>العملة {p.currency}</span></footer>
 </div>
}

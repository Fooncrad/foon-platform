import {BookOpen,ClipboardList,LayoutDashboard,ShoppingCart,UtensilsCrossed} from 'lucide-react';

type Props={slug:string;name:string;status:string;currency:string;categoryCount:number;itemCount:number;orderCount:number;openOrderCount:number};
export default function RestaurantDashboard(p:Props){
 const base='/restaurant/'+encodeURIComponent(p.slug);
 const cards=[
  ['الأقسام',p.categoryCount,BookOpen],['الأصناف',p.itemCount,UtensilsCrossed],['إجمالي الطلبات',p.orderCount,ClipboardList],['طلبات مفتوحة',p.openOrderCount,ShoppingCart]
 ] as const;
 return <div className="restaurant-ops" dir="rtl">
  <div className="restaurant-ops-head"><div><span className="restaurant-ops-kicker"><LayoutDashboard size={16}/> مركز التشغيل</span><h1>{p.name}</h1><p>إدارة المطعم والطلبات والمنيو من مساحة تشغيل واحدة.</p></div></div>
  <section className="restaurant-stat-grid">{cards.map(([label,value,Icon])=><article key={label}><span><Icon size={19}/></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</section>
 </div>
}

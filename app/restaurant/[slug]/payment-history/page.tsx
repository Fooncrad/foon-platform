import Link from 'next/link';
import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant'),{slug}=await params;
 const t=await database().prepare("SELECT t.id FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? LIMIT 1").bind(user.userId,slug).first<{id:string}>();
 if(!t)redirect('/restaurant');
 let rows:any[]|null=null;
 try{rows=(await database().prepare("SELECT id,method,amount,currency,transaction_reference,status,submitted_at,reviewed_at,review_note FROM payment_requests WHERE tenant_id=? ORDER BY submitted_at DESC").bind(t.id).all<any>()).results}catch(e){console.error('Restaurant payment history unavailable',e instanceof Error?e.name:'Unknown')}
 return <div className="restaurant-v2-workspace"><section className="restaurant-v2-card"><header><div><small>المالية</small><h2>المدفوعات والفواتير</h2></div></header>{rows===null?<div className="restaurant-v2-empty" role="alert"><p>تعذر تحميل سجل المدفوعات. قد تحتاج قاعدة البيانات إلى تحديث الجداول.</p><Link className="quiet-button" href={"/store/subscription?tenant="+encodeURIComponent(t.id)}>إدارة التفعيل والسداد</Link></div>:rows.length?<div className="restaurant-v2-orders">{rows.map(x=><div key={x.id}><span><b>{x.transaction_reference}</b><small>{x.method} · {x.status}</small></span><strong>{Number(x.amount).toLocaleString('en-US')} {x.currency}</strong></div>)}</div>:<div className="restaurant-v2-empty">لا توجد عمليات دفع مسجلة.</div>}</section></div>
}
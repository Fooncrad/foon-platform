import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/app/session';
import {database} from '@/db';

function safeReturn(value:string){return value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\')&&!value.startsWith('/logout')&&!value.startsWith('/login')?value:'/';}

export default async function AccountPage({searchParams}:{searchParams:Promise<{returnTo?:string}>}){
 const params=await searchParams;
 const returnTo=safeReturn(params.returnTo||'/');
 const user=await getCurrentUser();
 if(!user)redirect('/login?next='+encodeURIComponent('/account?returnTo='+encodeURIComponent(returnTo)));
 const stores=await database().prepare('SELECT t.id,t.name,t.slug,t.activity_id,m.role FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? ORDER BY t.created_at').bind(user.userId).all<{id:string;name:string;slug:string;activity_id:string;role:string}>();
 return <main className="account-page" dir="auto"><header><small>FOON</small><h1>الملف الشخصي · Profile</h1><p>معلومات حسابك وروابط مساحاتك · Your account details and workspaces</p></header><section><h2>بيانات الحساب · Account details</h2><dl><div><dt>الاسم · Name</dt><dd>{user.displayName}</dd></div><div><dt>البريد الإلكتروني · Email</dt><dd dir="ltr">{user.email}</dd></div></dl></section>{stores.results.length>0&&<section><h2>مساحاتك · Your workspaces</h2>{stores.results.map(store=><p key={store.id}><Link href={(store.activity_id==='restaurants'?'/restaurant/':'/store/')+encodeURIComponent(store.slug)}>{store.name}</Link></p>)}</section>}<footer><Link href={returnTo}>العودة للمنيو · Back to menu</Link><Link className="account-signout" href={'/logout?next='+encodeURIComponent(returnTo)}>تسجيل الخروج · Sign out</Link></footer></main>
}

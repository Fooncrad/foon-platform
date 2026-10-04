import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import RestaurantShell from '@/components/restaurant/restaurant-shell';

export default async function RestaurantLayout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');const {slug}=await params;const admin=Boolean(process.env.PLATFORM_ADMIN_EMAIL)&&user.email.toLowerCase()===process.env.PLATFORM_ADMIN_EMAIL!.toLowerCase();
 const restaurant=admin?await database().prepare("SELECT t.slug,t.name FROM tenants t WHERE t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(slug).first<{slug:string;name:string}>():await database().prepare("SELECT t.slug,t.name FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{slug:string;name:string}>();
 if(!restaurant)redirect(admin?'/admin':'/restaurant');
 return <RestaurantShell slug={restaurant.slug} name={restaurant.name}>{children}</RestaurantShell>
}

import {redirect} from 'next/navigation';
import {database} from '@/db';
import {requireUser} from '@/app/session';
import RestaurantShell from '@/components/restaurant/restaurant-shell';

export default async function RestaurantLayout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){
 const user=await requireUser('/restaurant');const {slug}=await params;
 const restaurant=await database().prepare("SELECT t.slug,t.name FROM memberships m JOIN tenants t ON t.id=m.tenant_id WHERE m.user_id=? AND t.slug=? AND t.activity_id='restaurants' LIMIT 1").bind(user.userId,slug).first<{slug:string;name:string}>();
 if(!restaurant)redirect('/restaurant');
 return <RestaurantShell slug={restaurant.slug} name={restaurant.name}>{children}</RestaurantShell>
}

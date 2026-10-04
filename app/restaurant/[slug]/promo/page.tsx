import RestaurantModule from '@/components/restaurant/restaurant-module';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <RestaurantModule slug={slug} module="promo"/>}

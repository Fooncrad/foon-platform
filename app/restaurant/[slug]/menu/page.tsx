import RestaurantMenuManager from '@/components/restaurant/menu-manager';
export default async function RestaurantMenuPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <RestaurantMenuManager slug={slug}/>}

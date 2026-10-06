import RestaurantMenu from '@/components/menu/restaurant-menu';

export default async function MenuPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  return <RestaurantMenu slug={slug}/>;
}

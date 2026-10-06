import BrandThemeManager from '@/components/restaurant/brand-theme-manager';
export default async function BrandThemePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <BrandThemeManager slug={slug}/>;}

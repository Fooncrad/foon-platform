import {notFound} from 'next/navigation';
import {database} from '@/db';
import PublicPage from '@/components/platform/public-page';
export const dynamic='force-dynamic';
type Page={slug:string;titleAr?:string;titleEn?:string;titleFr?:string;bodyAr?:string;bodyEn?:string;bodyFr?:string};
const legal:Record<string,{titleAr:string;titleEn:string;titleFr:string;key:string}>={
 terms:{titleAr:'الشروط والأحكام',titleEn:'Terms & Conditions',titleFr:'Conditions générales',key:'terms_page_json'},
 privacy:{titleAr:'سياسة الخصوصية',titleEn:'Privacy Policy',titleFr:'Politique de confidentialité',key:'privacy_page_json'},
 refund:{titleAr:'سياسة الاسترجاع',titleEn:'Refund Policy',titleFr:'Politique de remboursement',key:'refund_page_json'}
};
export default async function PageRoute({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!/^[a-z0-9-]{2,60}$/.test(slug))notFound();const rows=await database().prepare("SELECT key,value FROM platform_settings WHERE key IN ('custom_pages_json','terms_page_json','privacy_page_json','refund_page_json')").all<{key:string;value:string}>();const settings=Object.fromEntries(rows.results.map(x=>[x.key,x.value]));let page:Page|undefined;if(legal[slug]){const meta=legal[slug];try{page={slug,...meta,...JSON.parse(settings[meta.key]||'{}')}}catch{page={slug,...meta}}}else{try{page=(JSON.parse(settings.custom_pages_json||'[]') as Page[]).find(x=>x.slug===slug)}catch{}}if(!page)notFound();return <PublicPage page={page}/>;}

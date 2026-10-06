import {database} from '@/db';
export const dynamic='force-dynamic';
const locales=['ar','en','fr'] as const;
export async function GET(){
 try{
  const rows=await database().prepare("SELECT key,value FROM platform_settings WHERE key IN ('translations_ar_json','translations_en_json','translations_fr_json')").all<{key:string;value:string}>();
  const dictionaries:Record<string,Record<string,string>>={};
  for(const locale of locales){const row=rows.results.find(r=>r.key===`translations_${locale}_json`);if(!row)continue;try{const value=JSON.parse(row.value);if(value&&typeof value==='object'&&!Array.isArray(value))dictionaries[locale]=value}catch{}}
  return Response.json({dictionaries},{headers:{'Cache-Control':'public, max-age=60, stale-while-revalidate=300'}});
 }catch{return Response.json({dictionaries:{}},{status:200,headers:{'Cache-Control':'no-store'}})}
}

import {database} from '@/db';
export const dynamic='force-dynamic';
export async function GET(){try{const rows=await database().prepare("SELECT key,value FROM platform_settings WHERE key IN ('site_name','support_email','instagram_url','facebook_url','linkedin_url','snapchat_url','tiktok_url','twitter_url','whatsapp_url','site_url','custom_pages_json')").all<{key:string;value:string}>();return Response.json({settings:Object.fromEntries(rows.results.map(x=>[x.key,x.value]))});}catch{return Response.json({settings:{site_name:'FOON',support_email:''}})}}

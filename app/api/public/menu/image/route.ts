import {Buffer} from 'node:buffer';
import {database} from '@/db';
export const dynamic='force-dynamic';
export async function GET(request:Request){const id=new URL(request.url).searchParams.get('id')||'';if(!/^[0-9a-f-]{36}$/i.test(id))return new Response(null,{status:404});try{const image=await database().prepare('SELECT content_type,image_data FROM menu_item_images WHERE id=? LIMIT 1').bind(id).first<{content_type:string;image_data:Uint8Array}>();if(!image)return new Response(null,{status:404});return new Response(Buffer.from(image.image_data),{headers:{'Content-Type':image.content_type,'Cache-Control':'public, max-age=86400, stale-while-revalidate=604800','X-Content-Type-Options':'nosniff'}});}catch{return new Response(null,{status:503});}}

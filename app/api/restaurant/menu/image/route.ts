import {database} from '@/db';
import {Buffer} from 'node:buffer';
import {ApiError,authorize,sameOrigin} from '@/lib/platform/security';
import {requireTenantFeature} from '@/lib/platform/entitlements';

export const dynamic='force-dynamic';
const types=new Set(['image/jpeg','image/png','image/webp']);
export async function POST(request:Request){try{
 sameOrigin(request);const form=await request.formData(),slug=String(form.get('slug')||''),file=form.get('file'),categoryId=String(form.get('categoryId')||'');
 if(!(file instanceof File)||!types.has(file.type)||file.size<1||file.size>5*1024*1024)throw new ApiError(400,'INVALID_IMAGE');
 const tenant=await database().prepare("SELECT id FROM tenants WHERE slug=? AND activity_id='restaurants' LIMIT 1").bind(slug).first<{id:string}>();if(!tenant)throw new ApiError(404,'NOT_FOUND');await authorize(tenant.id);await requireTenantFeature(tenant.id,'menu');
 if(categoryId&&!await database().prepare('SELECT id FROM menu_categories WHERE id=? AND tenant_id=?').bind(categoryId,tenant.id).first())throw new ApiError(404,'CATEGORY_NOT_FOUND');
 if(categoryId&&!await database().prepare('SELECT id FROM menu_categories WHERE id=? AND tenant_id=?').bind(categoryId,tenant.id).first())throw new ApiError(404,'CATEGORY_NOT_FOUND');const id=crypto.randomUUID(),bytes=Buffer.from(await file.arrayBuffer());const valid=file.type==='image/jpeg'?bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff:file.type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(!valid)throw new ApiError(400,'INVALID_IMAGE_CONTENT');await database().prepare('INSERT INTO menu_item_images(id,tenant_id,item_id,category_id,content_type,image_data,byte_size,created_at) VALUES(?,?,NULL,?,?,?,?,?)').bind(id,tenant.id,categoryId||null,file.type,bytes,bytes.byteLength,Date.now()).run();
 return Response.json({imageUrl:`/api/public/menu/image?id=${id}`},{status:201});
 }catch(error){if(error instanceof ApiError)return Response.json({error:error.code},{status:error.status});console.error('Menu image upload failed',error instanceof Error?error.name:'Unknown');return Response.json({error:'IMAGE_UPLOAD_FAILED'},{status:503});}}

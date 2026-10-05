import { database } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = (url.searchParams.get('slug') ?? '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(slug)) {
      return Response.json({ error: 'INVALID_SLUG' }, { status: 400 });
    }
    const store = await database().prepare(
      "SELECT id,name,slug,activity_id,country_code,currency,status,cover_image_url,phone,whatsapp,email_public,address_ar,address_en,address_fr,about_ar,about_en,about_fr,instagram_url,tiktok_url,snapchat_url,website_url,waiter_call_enabled FROM tenants WHERE slug=? AND activity_id='restaurants' AND status='active' LIMIT 1"
    ).bind(slug).first<Record<string, string>>();
    if (!store) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    const [categories,items,variants,groups,options,images,pages]=await Promise.all([
      database().prepare('SELECT id,name_ar,name_en,name_fr,image_url,sort_order FROM menu_categories WHERE tenant_id=? AND enabled=1 ORDER BY sort_order,name_ar').bind(store.id).all(),
      database().prepare('SELECT i.id,i.category_id,i.name_ar,i.name_en,i.name_fr,i.description_ar,i.description_en,i.description_fr,i.short_description_ar,i.short_description_en,i.short_description_fr,i.long_description_ar,i.long_description_en,i.long_description_fr,i.price,i.discount_price,i.tax_rate,i.tax_included,i.stock_quantity,i.track_inventory,i.dietary_type,i.sort_order,i.image_url,i.calories FROM menu_items i JOIN menu_categories c ON c.id=i.category_id AND c.tenant_id=i.tenant_id AND c.enabled=1 WHERE i.tenant_id=? AND i.enabled=1 AND (i.track_inventory=0 OR i.stock_quantity>0) ORDER BY c.sort_order,i.sort_order,i.created_at DESC').bind(store.id).all(),
      database().prepare('SELECT id,item_id,name_ar,name_en,name_fr,price_delta FROM menu_item_variants WHERE tenant_id=? AND enabled=1 ORDER BY sort_order').bind(store.id).all(),
      database().prepare('SELECT id,item_id,title_ar,title_en,title_fr,selection_type,is_required,min_select,max_select,max_qty FROM menu_addon_groups WHERE tenant_id=? AND enabled=1 ORDER BY sort_order').bind(store.id).all(),
      database().prepare('SELECT id,group_id,name_ar,name_en,name_fr,price_delta FROM menu_addon_options WHERE tenant_id=? AND enabled=1 ORDER BY sort_order').bind(store.id).all(),database().prepare('SELECT id,item_id FROM menu_item_images WHERE tenant_id=? AND item_id IS NOT NULL ORDER BY created_at,id').bind(store.id).all(),database().prepare('SELECT slug,title_ar,title_en,title_fr FROM restaurant_public_pages WHERE tenant_id=? AND enabled=1 ORDER BY sort_order,title_ar').bind(store.id).all()
    ]);
    const optionsByGroup=new Map<string,unknown[]>();for(const option of options.results as Array<{group_id:string}>){optionsByGroup.set(option.group_id,[...(optionsByGroup.get(option.group_id)||[]),option]);}const groupsByItem=new Map<string,unknown[]>();for(const group of groups.results as Array<{id:string;item_id:string}>){groupsByItem.set(group.item_id,[...(groupsByItem.get(group.item_id)||[]),{...group,options:optionsByGroup.get(group.id)||[]}]);}const variantsByItem=new Map<string,unknown[]>();for(const variant of variants.results as Array<{item_id:string}>){variantsByItem.set(variant.item_id,[...(variantsByItem.get(variant.item_id)||[]),variant]);}const imagesByItem=new Map<string,string[]>();for(const image of images.results as Array<{id:string;item_id:string}>){imagesByItem.set(image.item_id,[...(imagesByItem.get(image.item_id)||[]),`/api/public/menu/image?id=${image.id}`]);}
    let businessHours:Array<{day_of_week:number;open_time:string|null;close_time:string|null;closed:number}>=[];try{const rows=await database().prepare('SELECT day_of_week,open_time,close_time,closed FROM restaurant_business_hours WHERE tenant_id=? ORDER BY day_of_week').bind(store.id).all<{day_of_week:number;open_time:string|null;close_time:string|null;closed:number}>();businessHours=rows.results}catch{}
    let orderTypes:Record<string,boolean>={pickup:true,takeaway:true,dine_in:true,delivery:true,room_service:true,reservation:true};try{const configured=await database().prepare('SELECT order_type,enabled FROM restaurant_order_type_settings WHERE tenant_id=?').bind(store.id).all<{order_type:string;enabled:number}>();for(const row of configured.results)if(row.order_type in orderTypes)orderTypes[row.order_type]=Boolean(Number(row.enabled));}catch{};
    let orderPolicies:Record<string,unknown>={};try{const rows=await database().prepare('SELECT order_type,min_order,service_fee,service_fee_label_ar,service_fee_label_en,service_fee_label_fr,max_active_orders,requires_driver FROM restaurant_order_policies WHERE tenant_id=?').bind(store.id).all<Record<string,unknown>>();for(const row of rows.results)orderPolicies[String(row.order_type)]=row;}catch{};
    let appearance:Record<string,unknown>={template:'grid'};try{const row=await database().prepare('SELECT published_json FROM restaurant_appearance_settings WHERE tenant_id=?').bind(store.id).first<{published_json:string|null}>();if(row?.published_json)appearance=JSON.parse(row.published_json);}catch{}
    let whatsappOrderEnabled=0;
    try{const grant=await database().prepare("SELECT pf.enabled FROM subscriptions s JOIN package_plan_features pf ON pf.plan_id=s.plan_id AND pf.feature_id='whatsapp_order' WHERE s.tenant_id=? AND s.status='active' AND (s.expires_at IS NULL OR s.expires_at>?) ORDER BY s.created_at DESC LIMIT 1").bind(store.id,Date.now()).first<{enabled:number|string}>();whatsappOrderEnabled=Number(grant?.enabled??0);}catch{}
    const configuredPages=appearance&&typeof appearance==='object'&&'pages' in appearance?(appearance as {pages?:Record<string,{enabled?:boolean;title?:string;content?:string}>}).pages||{}:{};
    const appearancePages=Object.entries(configuredPages).filter(([,page])=>page?.enabled!==false&&page?.title).map(([slug,page])=>({slug,title_ar:page.title||slug,title_en:page.title_en||page.title||slug,title_fr:page.title_fr||page.title_en||page.title||slug,content:page.content||'',content_en:page.content_en||page.content||'',content_fr:page.content_fr||page.content_en||page.content||'',source:'appearance'}));
    const legacyPages=(pages.results as Array<Record<string,unknown>>).filter(page=>!appearancePages.some(p=>p.slug===String(page.slug)));
    return Response.json({ store, appearance, businessHours, whatsappOrderEnabled:Boolean(whatsappOrderEnabled), orderTypes, orderPolicies, pages:[...appearancePages,...legacyPages], categories: categories.results, items:(items.results as Array<{id:string}>).map(item=>({...item,image_urls:imagesByItem.get(item.id)||[],variants:variantsByItem.get(item.id)||[],addon_groups:groupsByItem.get(item.id)||[]})) },{headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }
}

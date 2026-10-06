import {ApiError} from '@/lib/platform/security';
import {database} from '@/db';

export type MenuSelection={id:string;quantity:number};
export async function priceMenuSelection(tenantId:string,itemId:string,selection:{variantId?:string;options?:MenuSelection[];locale?:string;quantity?:number}){
 const item=await database().prepare('SELECT i.id,i.name_ar,i.name_en,i.name_fr,i.price,i.discount_price,i.tax_rate,i.tax_included,i.track_inventory,i.stock_quantity FROM menu_items i JOIN menu_categories c ON c.id=i.category_id AND c.tenant_id=i.tenant_id AND c.enabled=1 WHERE i.id=? AND i.tenant_id=? AND i.enabled=1').bind(itemId,tenantId).first<{id:string;name_ar:string;name_en:string;name_fr:string;price:number|string;discount_price:number|string|null;tax_rate:number|string;tax_included:number|string;track_inventory:number|string;stock_quantity:number|string}>();
 if(!item)throw new ApiError(409,'MENU_CHANGED');
 const quantity=selection.quantity||1;if(Number(item.track_inventory)>0&&Number(item.stock_quantity)<quantity)throw new ApiError(409,'ITEM_OUT_OF_STOCK');
 const variants=(await database().prepare('SELECT id,name_ar,name_en,name_fr,price_delta FROM menu_item_variants WHERE item_id=? AND tenant_id=? AND enabled=1 ORDER BY sort_order').bind(itemId,tenantId).all()).results as Array<{id:string;name_ar:string;name_en:string;name_fr:string;price_delta:number|string}>;
 const groups=(await database().prepare('SELECT id,title_ar,title_en,title_fr,selection_type,is_required,min_select,max_select,max_qty FROM menu_addon_groups WHERE item_id=? AND tenant_id=? AND enabled=1 ORDER BY sort_order').bind(itemId,tenantId).all()).results as Array<{id:string;title_ar:string;title_en:string;title_fr:string;selection_type:string;is_required:number|string;min_select:number|string;max_select:number|string;max_qty:number|string}>;
 const choice=selection.locale==='en'||selection.locale==='fr'?selection.locale:'ar',label=(x:{name_ar?:string;name_en?:string;name_fr?:string;title_ar?:string;title_en?:string;title_fr?:string})=>choice==='fr'?(x.name_fr||x.title_fr||x.name_en||x.title_en||x.name_ar||x.title_ar||''):choice==='en'?(x.name_en||x.title_en||x.name_ar||x.title_ar||''):(x.name_ar||x.title_ar||x.name_en||x.title_en||'');
 const optionSelections=selection.options||[];const selectedOptions:Array<{id:string;groupId:string;name:string;unitCents:number}>=[];if(optionSelections.length>100||new Set(optionSelections.map(x=>x.id)).size!==optionSelections.length)throw new ApiError(400,'INVALID_ADDON_SELECTION');
 let cents=Math.round(Number(item.discount_price??item.price)*100);const details:string[]=[];if(variants.length){const v=variants.find(x=>x.id===selection.variantId);if(!v)throw new ApiError(400,'VARIANT_REQUIRED');cents+=Math.round(Number(v.price_delta)*100);details.push(label(v));}else if(selection.variantId)throw new ApiError(400,'INVALID_VARIANT');
 const validOptionIds=new Set<string>();
 for(const group of groups){
  const available=(await database().prepare('SELECT id,name_ar,name_en,name_fr,price_delta,stock_quantity FROM menu_addon_options WHERE group_id=? AND tenant_id=? AND enabled=1 ORDER BY sort_order').bind(group.id,tenantId).all()).results as Array<{id:string;name_ar:string;name_en:string;name_fr:string;price_delta:number|string;stock_quantity:number|string}>;
  const byId=new Map(available.map(o=>[o.id,o]));for(const id of byId.keys())validOptionIds.add(id);
  const groupSelections=optionSelections.filter(x=>byId.has(x.id)),count=groupSelections.reduce((sum,x)=>sum+x.quantity,0),distinct=groupSelections.length,min=Number(group.min_select),max=Number(group.max_select),maxQty=Number(group.max_qty);
  if(groupSelections.some(x=>!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>maxQty))throw new ApiError(400,'INVALID_ADDON_QUANTITY');
  if(group.selection_type==='single'&&distinct>1)throw new ApiError(400,'TOO_MANY_ADDONS');
  if((Number(group.is_required)>0&&count<Math.max(min,1))||count<min||(max>0&&count>max))throw new ApiError(400,'ADDON_SELECTION_REQUIRED');
  for(const picked of groupSelections){const option=byId.get(picked.id)!;if(Number(option.stock_quantity)>0&&Number(option.stock_quantity)<picked.quantity*quantity)throw new ApiError(409,'ADDON_OUT_OF_STOCK');const optionCents=Math.round(Number(option.price_delta)*100);cents+=optionCents*picked.quantity;selectedOptions.push({id:option.id,groupId:group.id,name:`${label(group)}: ${label(option)}`.slice(0,180),unitCents:optionCents});details.push(`${label(group)}: ${label(option)}${picked.quantity>1?` ×${picked.quantity}`:''}`);}
 }
 if(optionSelections.some(x=>!validOptionIds.has(x.id)))throw new ApiError(400,'INVALID_ADDON_SELECTION');
 if(cents<0||!Number.isSafeInteger(cents))throw new ApiError(400,'INVALID_TOTAL');
 const rate=Number(item.tax_rate),included=Number(item.tax_included)>0,taxCents=rate>0?(included?Math.round(cents*rate/(100+rate)):Math.round(cents*rate/100)):0;
 const unitCents=included?cents:cents+taxCents,subtotalCents=included?cents-taxCents:cents;
 return {unitCents,subtotalCents,taxCents,itemId:item.id,quantity,selectedOptions,itemName:`${label(item)}${details.length?` — ${details.join(', ')}`:''}`.slice(0,180)};
}

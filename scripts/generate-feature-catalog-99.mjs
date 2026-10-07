import {writeFileSync} from 'node:fs';

const tiers=[
 {id:'starter',ar:'البداية',en:'Starter',count:15},
 {id:'basic',ar:'الأساسية',en:'Basic',count:40},
 {id:'business',ar:'الأعمال',en:'Business',count:70},
 {id:'professional',ar:'الاحترافية',en:'Professional',count:99},
];

const groups=[
 ['الهوية والواجهة العامة','Brand & storefront',[
  ['welcome_page','صفحة واجهة النشاط','Public storefront page'],['custom_domain','نطاق مخصص','Custom domain'],['seo_metadata','تهيئة محركات البحث SEO','SEO metadata'],['social_links','روابط التواصل الاجتماعي','Social links'],['restaurant_settings','ساعات العمل وإعدادات النشاط','Business hours and settings'],['multilingual_ui','واجهة متعددة اللغات','Multilingual interface'],['rtl_support','دعم العربية واتجاه RTL','Arabic and RTL support'],['dark_mode','الوضع الداكن','Dark mode'],['pwa_install','تثبيت كتطبيق PWA','PWA installation'],['branded_qr','رمز QR يحمل الهوية','Branded QR code']
 ]],
 ['المنيو والكتالوج','Menu & catalog',[
  ['menu','إدارة المنيو والمنتجات','Menu and product catalog'],['restaurant_packages','خيارات وأحجام المنتج','Product variants and sizes'],['specialities','الإضافات والإضافات المركبة','Product add-ons'],['product_images','صور المنتجات','Product images'],['allergens_labels','وسوم مسببات الحساسية','Allergen labels'],['nutrition_info','المعلومات الغذائية','Nutrition information'],['stock_visibility','إظهار التوفر والمخزون','Stock visibility'],['scheduled_availability','التوفر المجدول','Scheduled availability'],['bulk_import','استيراد المنتجات بالجملة','Bulk product import'],['barcode_catalog','كتالوج الباركود','Barcode catalog'],['recipe_costing','تكلفة الوصفات','Recipe costing'],['product_reviews','تقييمات المنتجات','Product reviews']
 ]],
 ['الطلبات والقنوات','Orders & channels',[
  ['orders','الطلبات الإلكترونية','Online orders'],['dine_in','طلبات داخل النشاط','Dine-in orders'],['pickup','طلبات الاستلام','Pickup orders'],['room_service','طلبات التوصيل وخدمة الغرف','Delivery and room-service orders'],['whatsapp_order','طلبات واتساب','WhatsApp orders'],['order_status_tracking','تتبع حالة الطلب','Order status tracking'],['scheduled_orders','الطلبات المجدولة','Scheduled orders'],['multi_branch_orders','طلبات الفروع المتعددة','Multi-branch orders'],['order_notes','ملاحظات الطلب','Order notes'],['split_orders','تقسيم الطلبات','Split orders'],['refunds_returns','المرتجعات والاسترداد','Refunds and returns'],['guest_checkout','الدفع كزائر','Guest checkout']
 ]],
 ['نقاط البيع والدفع','POS & payments',[
  ['pos','نقطة البيع POS','POS terminal'],['offline_pos','نقطة بيع دون اتصال','Offline POS'],['cash_payment','الدفع النقدي','Cash payments'],['online_payment','الدفع الإلكتروني','Online payments'],['payment_links','روابط الدفع','Payment links'],['digital_receipts','الإيصالات الرقمية','Digital receipts'],['split_payments','تقسيم المدفوعات','Split payments'],['tips_service_charge','الإكراميات ورسوم الخدمة','Tips and service charges'],['tax_invoicing','الفوترة الضريبية','Tax invoicing'],['cash_drawer','إدارة درج النقدية','Cash drawer management']
 ]],
 ['الحجوزات والطاولات','Reservations & tables',[
  ['reservations','الحجوزات','Reservations'],['tables','خريطة الطاولات','Table map'],['qr_menu','طلب QR للطاولة','QR table ordering'],['waitlist','قائمة الانتظار','Waitlist'],['table_status','حالة الطاولات','Table status'],['floor_sections','أقسام الصالة','Floor sections'],['table_service_events','أحداث خدمة الطاولة','Table service events'],['waiter_call','نداء النادل','Waiter call'],['reservation_reminders','تذكير الحجوزات','Reservation reminders'],['deposits_no_show','العربون وحالات عدم الحضور','Deposits and no-show rules']
 ]],
 ['المخزون والمشتريات','Inventory & purchasing',[
  ['inventory','إدارة المخزون','Inventory management'],['low_stock_alerts','تنبيهات انخفاض المخزون','Low-stock alerts'],['ingredient_units','وحدات ومكونات الوصفة','Ingredient units and recipe components'],['stock_movements','حركة المخزون','Stock movements'],['purchase_orders','أوامر الشراء','Purchase orders'],['suppliers','إدارة الموردين','Supplier management'],['receiving','استلام المشتريات','Purchase receiving'],['waste_tracking','تسجيل الهدر','Waste tracking'],['inventory_counts','جرد المخزون','Inventory counts'],['menu_stock_deduction','خصم المخزون من المنيو','Menu stock deduction']
 ]],
 ['الموظفون والتشغيل','Staff & operations',[
  ['staff','حسابات الموظفين','Staff accounts'],['roles_permissions','الأدوار والصلاحيات','Roles and permissions'],['branch_access','صلاحيات الوصول للفروع','Branch access control'],['shifts_attendance','الورديات والحضور','Shifts and attendance'],['kds','شاشة المطبخ KDS','Kitchen display system'],['kitchen_routing','توجيه الطلبات للمحطات','Kitchen routing'],['printing','توجيه الطباعة','Printer routing'],['delivery_staff','موظفو التوصيل','Delivery staff']
 ]],
 ['التسويق والعملاء','Marketing & CRM',[
  ['contacts','ملفات العملاء','Customer profiles'],['customer_segments','شرائح العملاء','Customer segments'],['loyalty_points','نقاط الولاء','Loyalty points'],['coupons_discounts','الكوبونات والخصومات','Coupons and discounts'],['campaigns','الحملات التسويقية','Marketing campaigns'],['abandoned_cart','استرجاع السلة المتروكة','Abandoned-cart recovery'],['feedback_reviews','الملاحظات والتقييمات','Feedback and reviews'],['affiliate','برنامج الإحالة','Referral program']
 ]],
 ['التقارير والتحليلات','Analytics & reports',[
  ['analytics','لوحة مبيعات مباشرة','Live sales dashboard'],['product_analytics','تحليل أداء المنتجات','Product analytics'],['staff_performance','أداء الموظفين','Staff performance'],['inventory_reports','تقارير المخزون','Inventory reports'],['financial_reports','التقارير المالية','Financial reports'],['export_reports','تصدير التقارير','Report export'],['custom_reports','تقارير مخصصة','Custom reports']
 ]],
 ['التكاملات والأتمتة','Integrations & automation',[
  ['webhooks_api','واجهات API و Webhooks','API and webhooks'],['email_notifications','إشعارات البريد الإلكتروني','Email notifications'],['pwa_push','إشعارات Push','Push notifications'],['sms_notifications','إشعارات SMS','SMS notifications'],['accounting_integration','تكامل المحاسبة','Accounting integration'],['delivery_integrations','تكامل شركات التوصيل','Delivery integrations']
 ]],
 ['الأمان والتوسع','Security & scale',[
  ['audit_log','سجل التدقيق','Audit log'],['backups_restore','النسخ الاحتياطي والاستعادة','Backups and restore'],['rate_limiting','حماية معدل الطلبات','Rate limiting'],['multi_tenant_isolation','عزل بيانات النشاط','Multi-tenant isolation'],['api_keys','مفاتيح API','API keys'],['priority_support','دعم أولوية','Priority support']
 ]],
];

const features=[];
for(const [category,categoryEn,items] of groups){
 for(const [id,ar,en] of items) features.push({id,ar,en,category,categoryEn});
}
if(features.length!==99) throw new Error(`Expected 99 features, got ${features.length}`);
const sqlEscape=value=>String(value).replaceAll('\\','\\\\').replaceAll("'","''");
const values=features.map(f=>`('${sqlEscape(f.id)}','${sqlEscape(f.ar)}','${sqlEscape(f.en)}','${sqlEscape(f.en)}','${sqlEscape(f.category)}: ${sqlEscape(f.ar)}','${sqlEscape(f.categoryEn)}: ${sqlEscape(f.en)}','${sqlEscape(f.categoryEn)}: ${sqlEscape(f.en)}',UNIX_TIMESTAMP()*1000)`).join(',\n');
const ids=features.map(f=>`'${sqlEscape(f.id)}'`).join(',');
const planRows=tiers.map(t=>` ('${t.id}',f.id,CASE WHEN f.id IN (${features.slice(0,t.count).map(f=>`'${f.id}'`).join(',')}) THEN 1 ELSE 0 END,NULL,UNIX_TIMESTAMP()*1000)`).join(',\n');
const migration=`-- FOON 99-feature catalog for restaurants, cafes and stores.\n-- Additive and idempotent: no existing rows or business data are deleted.\nINSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at) VALUES\n${values};\n\nINSERT IGNORE INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)\nSELECT p.id,f.id,CASE\n WHEN p.id='starter' AND f.id IN (${features.slice(0,15).map(f=>`'${f.id}'`).join(',')}) THEN 1\n WHEN p.id='basic' AND f.id IN (${features.slice(0,40).map(f=>`'${f.id}'`).join(',')}) THEN 1\n WHEN p.id='business' AND f.id IN (${features.slice(0,70).map(f=>`'${f.id}'`).join(',')}) THEN 1\n WHEN p.id='professional' THEN 1 ELSE 0 END,NULL,UNIX_TIMESTAMP()*1000\nFROM package_plans p CROSS JOIN feature_definitions f\nWHERE f.id IN (${ids});\n\nUPDATE package_plan_features\nSET enabled=CASE\n WHEN plan_id='starter' AND feature_id IN (${features.slice(0,15).map(f=>`'${f.id}'`).join(',')}) THEN 1\n WHEN plan_id='basic' AND feature_id IN (${features.slice(0,40).map(f=>`'${f.id}'`).join(',')}) THEN 1\n WHEN plan_id='business' AND feature_id IN (${features.slice(0,70).map(f=>`'${f.id}'`).join(',')}) THEN 1\n WHEN plan_id='professional' THEN 1 ELSE 0 END,\n updated_at=UNIX_TIMESTAMP()*1000\nWHERE feature_id IN (${ids});\n`;
writeFileSync('db/mysql/0050_feature_catalog_99.sql',migration);

const checks=tiers.map(t=>`| ${t.ar} (${t.en}) | ${t.count} | ${t.id==='business'?'399 SAR / شهر':'السعر الحالي من النظام'} | ${t.count===99?'جميع المزايا':'أول '+t.count+' ميزة من الكتالوج'} |`).join('\n');
let report=`# تقرير كتالوج 99 ميزة — FOON\n\n> **النطاق:** مزايا مشتركة للمطاعم والمقاهي والمتاجر. تم اعتماد تدرّج من أربع باقات: Starter (15)، Basic (40)، Business (70)، Professional (99). الأسعار غير المعروضة بقيت كما هي في النظام ولم يتم اختراع أسعار جديدة.\n\n## ملخص الباقات\n\n| الباقة | عدد المزايا | السعر الشهري الحالي | التغطية |\n|---|---:|---:|---|\n${checks}\n\n### منهج التدرج\n- **Starter:** واجهة النشاط، أساسيات الكتالوج، والقدرات الأولى للبدء.\n- **Basic:** يضيف قنوات الطلب ونقاط البيع الأساسية.\n- **Business:** يضيف التشغيل المتقدم، الحجوزات، المخزون، والموظفين.\n- **Professional:** يفتح كتالوج المزايا التسع والتسعين كاملًا، بما فيه CRM والتحليلات والتكاملات والأمان.\n\n## المصفوفة الكاملة\n\n| # | التصنيف | المعرّف | الميزة بالعربية | Feature | Starter | Basic | Business | Professional |\n|---:|---|---|---|---|:---:|:---:|:---:|:---:|\n`;
features.forEach((f,i)=>{
 const n=i+1; const mark=t=>n<=t.count?'✓':'—';
 report+=`| ${n} | ${f.category} | \`${f.id}\` | ${f.ar} | ${f.en} | ${mark(tiers[0])} | ${mark(tiers[1])} | ${mark(tiers[2])} | ${mark(tiers[3])} |\n`;
});
report+=`\n## ملاحظات تنفيذية\n\n1. أضيفت المزايا في جدول \`feature_definitions\` وربطت بكل باقة في \`package_plan_features\`.\n2. الهجرة \`0050_feature_catalog_99.sql\` **إضافية وقابلة لإعادة التشغيل**؛ لا تحذف نشاطًا أو طلبًا أو منتجًا.\n3. واجهة \`GET /api/public/plans\` تعرض المزايا المفعلة تلقائيًا، لذلك سيظهر التقرير نفسه في أي شاشة تعتمد على API الباقات.\n4. حدود الاستخدام الرقمية (مثل عدد المنتجات والطلبات) بقيت منفصلة عن مفتاح التفعيل، حتى يمكن ضبطها لاحقًا حسب قرار التسعير.\n5. التفعيل النهائي للباقات يعتمد على وجود اشتراك نشط للمستأجر.\n`;
writeFileSync('docs/FEATURES-99-REPORT.md',report);
console.log(`Generated ${features.length} features, migration and report.`);

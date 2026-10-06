export const events=['welcome','order_received','order_confirmed','order_ready','order_cancelled','booking_confirmed','booking_cancelled','table_ready','subscription_activated','subscription_updated','password_reset'] as const;
export type MessageEvent=typeof events[number];
export const locales=['ar','en','fr'] as const;
export const placeholders=['customer_name','store_name','service_name','service_number','service_type','amount','currency','date','plan_name','expires_at','reset_url'] as const;
const copy={
 ar:{
  welcome:['مرحبًا بك في FOON','مرحبًا {{customer_name}}، يسعدنا انضمامك إلى {{store_name}}. أصبح حسابك جاهزًا للاستخدام.'],
  order_received:['تم استلام طلبك {{service_number}}','مرحبًا {{customer_name}}، استلم {{store_name}} طلبك بنجاح.\nرقم الطلب: {{service_number}}\nنوع الخدمة: {{service_type}}\nالإجمالي: {{amount}} {{currency}}.'],
  order_confirmed:['تم تأكيد طلبك {{service_number}}','مرحبًا {{customer_name}}، تم تأكيد طلبك لدى {{store_name}}.\nرقم الطلب: {{service_number}}\nنوع الخدمة: {{service_type}}\nالمبلغ: {{amount}} {{currency}}\nالتاريخ: {{date}}.'],
  order_ready:['طلبك جاهز {{service_number}}','مرحبًا {{customer_name}}، أصبح طلبك رقم {{service_number}} لدى {{store_name}} جاهزًا للاستلام.'],
  order_cancelled:['تم إلغاء الطلب {{service_number}}','مرحبًا {{customer_name}}، تم إلغاء طلبك رقم {{service_number}} لدى {{store_name}}. إذا كنت بحاجة إلى مساعدة، يرجى التواصل مع المتجر.'],
  booking_confirmed:['تم تأكيد الحجز {{service_number}}','مرحبًا {{customer_name}}، تم تأكيد حجزك لدى {{store_name}}.\nرقم الحجز: {{service_number}}\nالموعد: {{date}}.'],
  booking_cancelled:['تم إلغاء الحجز {{service_number}}','مرحبًا {{customer_name}}، تم إلغاء حجزك رقم {{service_number}} لدى {{store_name}}.'],
  table_ready:['طاولتك جاهزة — {{store_name}}','مرحبًا {{customer_name}}، طاولتك أصبحت جاهزة لدى {{store_name}}.\nرقم الخدمة: {{service_number}}.'],
  subscription_activated:['تم تفعيل اشتراك {{store_name}}','مرحبًا {{customer_name}}، تم تفعيل باقة {{plan_name}} لنشاط {{store_name}} بنجاح.\nتاريخ الانتهاء: {{expires_at}}.'],
  subscription_updated:['تم تحديث باقة {{store_name}}','تم تحديث باقة {{store_name}} إلى {{plan_name}} بنجاح.\nالمبلغ: {{amount}} {{currency}}\nرقم العملية: {{service_number}}\nالتاريخ: {{date}}\nتاريخ الانتهاء: {{expires_at}}.'],
  password_reset:['إعادة تعيين كلمة المرور','مرحبًا {{customer_name}}، تلقينا طلبًا لإعادة تعيين كلمة مرور حسابك في FOON.\nإعادة تعيين كلمة المرور: {{reset_url}}\nالرابط صالح لمدة 30 دقيقة ويمكن استخدامه مرة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.']
 },
 en:{
  welcome:['Welcome to FOON','Hello {{customer_name}}, welcome to {{store_name}}. Your account is ready to use.'],
  order_received:['Order received {{service_number}}','Hello {{customer_name}}, {{store_name}} received your order successfully.\nOrder: {{service_number}}\nService: {{service_type}}\nTotal: {{amount}} {{currency}}.'],
  order_confirmed:['Order confirmed {{service_number}}','Hello {{customer_name}}, your order at {{store_name}} has been confirmed.\nOrder: {{service_number}}\nService: {{service_type}}\nAmount: {{amount}} {{currency}}\nDate: {{date}}.'],
  order_ready:['Your order is ready {{service_number}}','Hello {{customer_name}}, your order {{service_number}} at {{store_name}} is ready for pickup.'],
  order_cancelled:['Order cancelled {{service_number}}','Hello {{customer_name}}, your order {{service_number}} at {{store_name}} has been cancelled. Please contact the store if you need assistance.'],
  booking_confirmed:['Booking confirmed {{service_number}}','Hello {{customer_name}}, your booking at {{store_name}} has been confirmed.\nBooking: {{service_number}}\nDate: {{date}}.'],
  booking_cancelled:['Booking cancelled {{service_number}}','Hello {{customer_name}}, your booking {{service_number}} at {{store_name}} has been cancelled.'],
  table_ready:['Your table is ready — {{store_name}}','Hello {{customer_name}}, your table at {{store_name}} is ready.\nReference: {{service_number}}.'],
  subscription_activated:['{{store_name}} subscription activated','Hello {{customer_name}}, the {{plan_name}} plan for {{store_name}} has been activated successfully.\nExpiry: {{expires_at}}.'],
  subscription_updated:['{{store_name}} plan updated','The plan for {{store_name}} has been updated to {{plan_name}} successfully.\nAmount: {{amount}} {{currency}}\nTransaction: {{service_number}}\nDate: {{date}}\nExpiry: {{expires_at}}.'],
  password_reset:['Reset your password','Hello {{customer_name}}, we received a request to reset your FOON account password.\nReset your password: {{reset_url}}\nThis link is valid for 30 minutes and can only be used once. If you did not request a password reset, ignore this email.']
 },
 fr:{
  welcome:['Bienvenue sur FOON','Bonjour {{customer_name}}, bienvenue chez {{store_name}}. Votre compte est prêt à être utilisé.'],
  order_received:['Commande reçue {{service_number}}','Bonjour {{customer_name}}, {{store_name}} a bien reçu votre commande.\nCommande : {{service_number}}\nService : {{service_type}}\nTotal : {{amount}} {{currency}}.'],
  order_confirmed:['Commande confirmée {{service_number}}','Bonjour {{customer_name}}, votre commande chez {{store_name}} a été confirmée.\nCommande : {{service_number}}\nService : {{service_type}}\nMontant : {{amount}} {{currency}}\nDate : {{date}}.'],
  order_ready:['Votre commande est prête {{service_number}}','Bonjour {{customer_name}}, votre commande {{service_number}} chez {{store_name}} est prête à être récupérée.'],
  order_cancelled:['Commande annulée {{service_number}}','Bonjour {{customer_name}}, votre commande {{service_number}} chez {{store_name}} a été annulée. Contactez le magasin si vous avez besoin d’aide.'],
  booking_confirmed:['Réservation confirmée {{service_number}}','Bonjour {{customer_name}}, votre réservation chez {{store_name}} a été confirmée.\nRéservation : {{service_number}}\nDate : {{date}}.'],
  booking_cancelled:['Réservation annulée {{service_number}}','Bonjour {{customer_name}}, votre réservation {{service_number}} chez {{store_name}} a été annulée.'],
  table_ready:['Votre table est prête — {{store_name}}','Bonjour {{customer_name}}, votre table chez {{store_name}} est prête.\nRéférence : {{service_number}}.'],
  subscription_activated:['Abonnement {{store_name}} activé','Bonjour {{customer_name}}, l’offre {{plan_name}} de {{store_name}} a été activée avec succès.\nExpiration : {{expires_at}}.'],
  subscription_updated:['Offre {{store_name}} mise à jour','L’offre de {{store_name}} a été mise à jour vers {{plan_name}} avec succès.\nMontant : {{amount}} {{currency}}\nTransaction : {{service_number}}\nDate : {{date}}\nExpiration : {{expires_at}}.'],
  password_reset:['Réinitialiser votre mot de passe','Bonjour {{customer_name}}, nous avons reçu une demande de réinitialisation du mot de passe de votre compte FOON.\nRéinitialiser votre mot de passe : {{reset_url}}\nCe lien est valable pendant 30 minutes et ne peut être utilisé qu’une seule fois. Si vous n’avez pas demandé cette réinitialisation, ignorez cet e-mail.']
 }
}
const serviceNames:Record<string,Record<'ar'|'en'|'fr',string>>={restaurants:{ar:'مطعم',en:'restaurant',fr:'restaurant'},groceries:{ar:'متجر بقالة',en:'grocery store',fr:'épicerie'},clothing:{ar:'متجر ملابس',en:'clothing store',fr:'boutique de vêtements'},perfumes:{ar:'متجر عطور',en:'perfume store',fr:'parfumerie'},accessories:{ar:'متجر إكسسوارات',en:'accessories store',fr:'boutique d’accessoires'},watches:{ar:'متجر ساعات',en:'watch store',fr:'boutique de montres'},gifts:{ar:'متجر هدايا',en:'gift shop',fr:'boutique de cadeaux'},carwash:{ar:'مغسلة سيارات',en:'car wash',fr:'lavage auto'},laundry:{ar:'مغسلة ملابس',en:'laundry',fr:'blanchisserie'},automotive:{ar:'خدمات سيارات',en:'automotive service',fr:'service automobile'},beauty:{ar:'مركز تجميل',en:'beauty service',fr:'service beauté'},works:{ar:'خدمات وأعمال',en:'service business',fr:'services professionnels'},sweets:{ar:'متجر حلويات',en:'sweets shop',fr:'pâtisserie'},ecommerce:{ar:'متجر إلكتروني',en:'online store',fr:'boutique en ligne'}};
export function defaultTemplate(event:MessageEvent,locale:keyof typeof copy,activityId?:string){const [subject,body]=copy[locale][event];const service=activityId?serviceNames[activityId]?.[locale]:undefined;const label=locale==='ar'?'نوع النشاط: ':locale==='fr'?'Type de service : ':'Service type: ';return {event,locale,subject,body:service?body+'\n'+label+service:body,source:'default'};}
export function validPlaceholders(value:string){return [...value.matchAll(/{{\s*([^{}]+)\s*}}/g)].every(m=>(placeholders as readonly string[]).includes(m[1].trim()));}

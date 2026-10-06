-- Four-plan catalog extension. Existing plans/prices are never overwritten.
INSERT IGNORE INTO package_plans(id,name_ar,name_en,monthly_price,currency,enabled,created_at) VALUES
 ('basic','الأساسية','Basic',0,'SAR',1,UNIX_TIMESTAMP()*1000),
 ('professional','الاحترافية','Professional',0,'SAR',1,UNIX_TIMESTAMP()*1000);

INSERT IGNORE INTO package_plan_meta(plan_id,description_ar,description_en,description_fr,plan_type,yearly_price,updated_at) VALUES
 ('starter','أقل باقة للبدء بالمنيو الأساسي','Entry plan with the smallest feature set','Formule d’entrée avec le minimum de fonctionnalités','monthly',0,UNIX_TIMESTAMP()*1000),
 ('basic','تشغيل أساسي للطلبات والحجوزات','Core operations for orders and reservations','Opérations essentielles pour commandes et réservations','monthly',0,UNIX_TIMESTAMP()*1000),
 ('business','تشغيل متقدم للأعمال','Advanced business operations','Opérations professionnelles avancées','monthly',0,UNIX_TIMESTAMP()*1000),
 ('professional','أعلى مستوى من خصائص المنصة','Highest platform feature tier','Niveau de fonctionnalités le plus complet','monthly',0,UNIX_TIMESTAMP()*1000);

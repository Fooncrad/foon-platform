-- Add the reference QR-menu entitlement without changing existing plan settings or prices.
INSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at)
VALUES('qr_menu','قائمة QR للطاولات','QR table menu','Menu QR par table','إنشاء رموز QR للطاولات وربط الطلبات بها.','Create table QR codes and accept orders through them.','Créer des QR de table et recevoir les commandes associées.',UNIX_TIMESTAMP()*1000);

-- Match the reference trial’s QR access to plans that already include dine-in service.
-- INSERT IGNORE preserves any explicit grant that the platform admin has already saved.
INSERT IGNORE INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)
SELECT dine_in.plan_id,'qr_menu',dine_in.enabled,NULL,UNIX_TIMESTAMP()*1000
FROM package_plan_features dine_in
WHERE dine_in.feature_id='dine_in';

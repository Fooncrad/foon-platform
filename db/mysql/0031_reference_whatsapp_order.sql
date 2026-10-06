-- WhatsApp ordering is an optional order channel from the reference catalog.
-- Grant it wherever online orders are already enabled; preserve explicit admin choices.
INSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at)
VALUES('whatsapp_order','الطلب عبر WhatsApp','WhatsApp ordering','Commande par WhatsApp','إرسال تفاصيل السلة إلى WhatsApp الخاص بالمطعم.','Send cart details to the restaurant WhatsApp number.','Envoyer le panier au WhatsApp du restaurant.',UNIX_TIMESTAMP()*1000);

INSERT IGNORE INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)
SELECT orders.plan_id,'whatsapp_order',orders.enabled,NULL,UNIX_TIMESTAMP()*1000
FROM package_plan_features orders
WHERE orders.feature_id='orders';

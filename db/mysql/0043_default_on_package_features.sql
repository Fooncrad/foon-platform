-- FOON default-on package capability reconciliation.
-- Every known capability is granted to every package by default.
-- Platform admins can still disable a capability afterwards by setting package_plan_features.enabled=0.
SET NAMES utf8mb4;

INSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at) VALUES
('tables','الطاولات','Tables','Tables','إدارة الطاولات والأقسام وحالة الخدمة.','Tables, sections and live service state.','Tables, sections et état du service.',UNIX_TIMESTAMP()*1000),
('waitlist','قائمة الانتظار','Waitlist','Liste d’attente','إدارة الانتظار وربطه بالطاولات.','Waitlist and table seating.','Liste d’attente et placement.',UNIX_TIMESTAMP()*1000),
('waiter_call','نداء النادل','Waiter call','Appel serveur','تعيين النادل ونداءات خدمة الطاولات.','Waiter assignments and table calls.','Affectation et appels serveur.',UNIX_TIMESTAMP()*1000),
('qr_menu','QR المنيو والطاولات','Menu & table QR','QR menu et tables','QR عام أو مرتبط بطاولة مع سياسات ورسوم.','General or table-bound QR with policies and fees.','QR général ou lié aux tables avec règles et frais.',UNIX_TIMESTAMP()*1000),
('printing','الطباعة','Printing','Impression','الطابعات ومحطات التحضير والتوجيه.','Printers, preparation stations and routing.','Imprimantes, stations et routage.',UNIX_TIMESTAMP()*1000),
('restaurant_settings','إعداد المطعم','Restaurant settings','Réglages restaurant','هوية المطعم والعملات واللغات وإعدادات الخدمة.','Restaurant identity, currency, languages and service settings.','Identité, devise, langues et réglages.',UNIX_TIMESTAMP()*1000);

INSERT INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)
SELECT p.id,f.id,1,NULL,UNIX_TIMESTAMP()*1000
FROM package_plans p CROSS JOIN feature_definitions f
ON DUPLICATE KEY UPDATE updated_at=VALUES(updated_at);

-- Explicitly activate operational capabilities in all current plans.
-- This is a one-time reconciliation; future admin changes remain respected.
UPDATE package_plan_features
SET enabled=1,updated_at=UNIX_TIMESTAMP()*1000
WHERE feature_id IN ('menu','orders','reservations','tables','waitlist','waiter_call','qr_menu','printing','restaurant_settings','dine_in','pickup','pos','inventory','staff','restaurant_packages');

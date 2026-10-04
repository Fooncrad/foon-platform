-- Reference-inspired default tiers for pristine plan grants.
-- Preserve prices and any plan the platform admin has already edited.
-- Starter follows the reference trial's 4-item / 3-order starting allowance.
INSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at) VALUES
('kds','شاشة المطبخ KDS','Kitchen display (KDS)','Écran cuisine (KDS)','عرض الطلبات المرسلة للمطبخ.','Kitchen order display.','Affichage des commandes cuisine.',UNIX_TIMESTAMP()*1000);

UPDATE package_plan_features pf
JOIN (
 SELECT plan_id,MIN(updated_at) AS seed_stamp
 FROM package_plan_features
 GROUP BY plan_id
 HAVING MIN(updated_at)=MAX(updated_at) AND SUM(enabled) = 0
) pristine ON pristine.plan_id=pf.plan_id
SET
 pf.enabled=CASE
  WHEN pf.plan_id='starter' AND pf.feature_id IN ('menu','orders','reservations','dine_in','pickup','cash_payment','kds') THEN 1
  WHEN pf.plan_id='basic' AND pf.feature_id IN ('menu','orders','reservations','dine_in','pickup','cash_payment','kds','analytics') THEN 1
  WHEN pf.plan_id='business' AND pf.feature_id IN ('menu','orders','reservations','dine_in','pickup','room_service','online_payment','cash_payment','pos','inventory','staff','delivery_staff','pwa_push','analytics','kds') THEN 1
  WHEN pf.plan_id='professional' THEN 1
  ELSE 0 END,
 pf.feature_limit=CASE
  WHEN pf.feature_id='menu' AND pf.plan_id='starter' THEN 4
  WHEN pf.feature_id='orders' AND pf.plan_id='starter' THEN 3
  WHEN pf.feature_id='menu' AND pf.plan_id='basic' THEN 30
  WHEN pf.feature_id='orders' AND pf.plan_id='basic' THEN 100
  WHEN pf.feature_id='menu' AND pf.plan_id='business' THEN 200
  WHEN pf.feature_id='orders' AND pf.plan_id='business' THEN 1000
  ELSE NULL END,
 pf.updated_at=UNIX_TIMESTAMP()*1000;

INSERT IGNORE INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)
SELECT p.id,'kds',CASE WHEN p.id='starter' OR p.id='basic' OR p.id='business' OR p.id='professional' THEN 1 ELSE 0 END,NULL,UNIX_TIMESTAMP()*1000
FROM package_plans p;

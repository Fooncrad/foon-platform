-- Add the reference capability catalog entries missing from FOON.
-- These are shown in the admin plan matrix; built-in site features are informational,
-- and unfinished modules remain unavailable until their implementation is delivered.
INSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at) VALUES
('welcome_page','صفحة الترحيب','Welcome page','Page d’accueil','موجودة ضمن واجهة FOON العامة؛ ليست صلاحية مستقلة للمطعم.','Provided by the shared FOON storefront; not a separate restaurant entitlement.','Incluse dans la vitrine FOON commune; pas une autorisation indépendante du restaurant.',UNIX_TIMESTAMP()*1000),
('restaurant_packages','باقات الوجبات','Restaurant meal packages','Formules de repas','باقات الوجبات المركبة غير منفذة بعد؛ لا تُفعّل على الباقات حاليًا.','Meal bundles are not implemented yet; do not enable for plans.','Les formules repas ne sont pas encore implémentées; ne pas activer pour les forfaits.',UNIX_TIMESTAMP()*1000),
('specialities','التخصصات والأقسام','Specialties & categories','Spécialités et catégories','تُدار الأقسام الحالية من ميزة المنيو؛ هذه تسمية توضيحية من المرجع.','Current categories are managed under Menu; this is a reference label.','Les catégories actuelles sont gérées dans Menu; cette entrée est informative.',UNIX_TIMESTAMP()*1000),
('contacts','بيانات التواصل العامة','Public contact details','Coordonnées publiques','بيانات التواصل جزء من الملف العام للمطعم وليست صلاحية منفصلة.','Contact details are part of the restaurant profile, not a separate entitlement.','Les coordonnées font partie du profil du restaurant, pas d’une autorisation indépendante.',UNIX_TIMESTAMP()*1000),
('affiliate','التسويق بالعمولة','Affiliate marketing','Marketing affilié','نظام التسويق بالعمولة غير منفذ بعد؛ لا تُفعّل هذه الميزة حاليًا.','Affiliate marketing is not implemented yet; do not enable this feature.','Le marketing affilié n’est pas encore implémenté; ne pas activer cette fonctionnalité.',UNIX_TIMESTAMP()*1000);

-- Ensure each plan has a row so the full reference catalog is visible per plan.
-- Existing grants are never overwritten.
INSERT IGNORE INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)
SELECT p.id,f.id,0,NULL,UNIX_TIMESTAMP()*1000
FROM package_plans p
JOIN feature_definitions f ON f.id IN ('welcome_page','restaurant_packages','specialities','contacts','affiliate');

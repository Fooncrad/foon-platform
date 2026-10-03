-- Restaurant package capabilities inspired by the licensed reference system.
-- Non-destructive: only adds missing feature definitions and grants; existing prices/plans are untouched.

INSERT IGNORE INTO feature_definitions(id,label_ar,label_en,label_fr,description_ar,description_en,description_fr,created_at) VALUES
('menu','المنيو والمنتجات','Menu & products','Menu et produits','إدارة المنيو والمنتجات مع حد اختياري لعدد العناصر.','Manage menu products with an optional item limit.','Gestion du menu et des produits avec limite optionnelle.',UNIX_TIMESTAMP()*1000),
('orders','الطلبات','Orders','Commandes','استقبال وإدارة الطلبات مع حد اختياري.','Receive and manage orders with an optional limit.','Réception et gestion des commandes avec limite optionnelle.',UNIX_TIMESTAMP()*1000),
('reservations','الحجوزات','Reservations','Réservations','إدارة الحجوزات وفتحات الحجز.','Manage reservations and booking slots.','Gestion des réservations et créneaux.',UNIX_TIMESTAMP()*1000),
('dine_in','الطلب داخل المطعم','Dine-in','Sur place','طلبات الطاولات والخدمة داخل المطعم.','Table and dine-in ordering.','Commandes à table et sur place.',UNIX_TIMESTAMP()*1000),
('pickup','الاستلام','Pickup','À emporter','طلبات الاستلام من المطعم.','Pickup ordering.','Commandes à emporter.',UNIX_TIMESTAMP()*1000),
('room_service','خدمة الغرف','Room service','Service en chambre','طلبات الفنادق وخدمة الغرف.','Hotel room-service ordering.','Commandes de service en chambre.',UNIX_TIMESTAMP()*1000),
('online_payment','الدفع الإلكتروني','Online payment','Paiement en ligne','إتاحة بوابة الدفع الإلكتروني للمتجر.','Enable the store online payment gateway.','Activer la passerelle de paiement en ligne.',UNIX_TIMESTAMP()*1000),
('cash_payment','الدفع النقدي','Cash payment','Paiement en espèces','إتاحة الدفع النقدي عند الخدمة.','Allow cash payment.','Autoriser le paiement en espèces.',UNIX_TIMESTAMP()*1000),
('pos','نقاط البيع','Point of sale','Point de vente','تشغيل نظام الكاشير ونقاط البيع.','Enable cashier and POS operations.','Activer les opérations de caisse et POS.',UNIX_TIMESTAMP()*1000),
('inventory','المخزون والمشتريات','Inventory & purchasing','Stock et achats','إدارة المخزون والمشتريات.','Inventory and purchasing management.','Gestion des stocks et achats.',UNIX_TIMESTAMP()*1000),
('staff','الموظفون والصلاحيات','Staff & permissions','Personnel et autorisations','إدارة الموظفين والأدوار والصلاحيات.','Staff, roles and permissions.','Personnel, rôles et autorisations.',UNIX_TIMESTAMP()*1000),
('delivery_staff','موظفو التوصيل','Delivery staff','Livreurs','إدارة موظفي وسائقي التوصيل.','Manage delivery staff and drivers.','Gestion des livreurs.',UNIX_TIMESTAMP()*1000),
('pwa_push','إشعارات الويب','Web push notifications','Notifications Web Push','إشعارات الطلبات والخدمات عبر الويب.','Web push notifications for operations.','Notifications Web Push des opérations.',UNIX_TIMESTAMP()*1000),
('analytics','التقارير والتحليلات','Analytics & reports','Analyses et rapports','التقارير التشغيلية والتحليلات.','Operational analytics and reports.','Analyses et rapports opérationnels.',UNIX_TIMESTAMP()*1000);

-- Preserve existing plan configuration. New capabilities default disabled until explicitly granted by the platform admin.
INSERT IGNORE INTO package_plan_features(plan_id,feature_id,enabled,feature_limit,updated_at)
SELECT p.id,f.id,0,NULL,UNIX_TIMESTAMP()*1000
FROM package_plans p
JOIN feature_definitions f ON f.id IN ('menu','orders','reservations','dine_in','pickup','room_service','online_payment','cash_payment','pos','inventory','staff','delivery_staff','pwa_push','analytics');

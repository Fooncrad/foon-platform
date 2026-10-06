-- FOON unified order sources, channels and operational context.
-- Additive migration. Run after 0009/0010.
ALTER TABLE restaurant_orders ADD COLUMN delivery_address VARCHAR(500) NULL AFTER pickup_label;
ALTER TABLE restaurant_orders ADD COLUMN delivery_lat DECIMAL(10,7) NULL AFTER delivery_address;
ALTER TABLE restaurant_orders ADD COLUMN delivery_lng DECIMAL(10,7) NULL AFTER delivery_lat;
ALTER TABLE restaurant_orders ADD COLUMN pickup_point_id VARCHAR(36) NULL AFTER delivery_lng;
ALTER TABLE restaurant_orders ADD COLUMN reservation_id VARCHAR(36) NULL AFTER pickup_point_id;
ALTER TABLE restaurant_orders ADD COLUMN waiter_reference VARCHAR(80) NULL AFTER reservation_id;
ALTER TABLE restaurant_orders ADD COLUMN source_label VARCHAR(120) NULL AFTER waiter_reference;

CREATE INDEX restaurant_orders_source_type_created ON restaurant_orders(tenant_id,source,order_type,created_at);
CREATE INDEX restaurant_orders_reservation ON restaurant_orders(reservation_id);
CREATE INDEX restaurant_orders_pickup_point ON restaurant_orders(pickup_point_id);

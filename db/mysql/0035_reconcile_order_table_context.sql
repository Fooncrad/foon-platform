-- FOON production reconciliation after schema audit.
-- Additive only. No DROP/DELETE and no existing column narrowing.
-- Production audit confirmed restaurant_orders is missing table_id while current POS code/migrations expect it.

ALTER TABLE restaurant_orders
  ADD COLUMN table_id VARCHAR(36) NULL AFTER order_type;

CREATE INDEX restaurant_orders_table ON restaurant_orders(table_id);

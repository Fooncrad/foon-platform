-- POS service context. Additive/non-destructive.
ALTER TABLE restaurant_orders ADD COLUMN order_type VARCHAR(30) NULL;
ALTER TABLE restaurant_orders ADD COLUMN table_id VARCHAR(36) NULL;
CREATE INDEX restaurant_orders_tenant_type ON restaurant_orders(tenant_id,order_type,created_at);
CREATE INDEX restaurant_orders_table ON restaurant_orders(table_id);

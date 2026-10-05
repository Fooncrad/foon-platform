-- FOON additive column reconciliation.
-- The migration runner treats duplicate columns/keys as harmless, so this safely repairs partial production schemas.

ALTER TABLE restaurant_coupons ADD COLUMN max_discount DECIMAL(12,2) NULL AFTER min_order;
ALTER TABLE restaurant_coupons ADD COLUMN per_customer_limit INT NULL AFTER usage_limit;
ALTER TABLE restaurant_coupons ADD KEY coupon_tenant_active(tenant_id,enabled,starts_at,ends_at);

ALTER TABLE restaurant_table_runtime ADD COLUMN min_order DECIMAL(12,2) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee DECIMAL(12,2) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee_label_ar VARCHAR(160) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee_label_en VARCHAR(160) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee_label_fr VARCHAR(160) NULL;

ALTER TABLE restaurant_tables ADD COLUMN section_id VARCHAR(36) NULL AFTER branch_id;
ALTER TABLE restaurant_tables ADD COLUMN name VARCHAR(120) NULL AFTER table_number;
ALTER TABLE restaurant_tables ADD KEY restaurant_tables_section(tenant_id,section_id);

ALTER TABLE restaurant_orders ADD COLUMN customer_locale VARCHAR(2) NULL AFTER notes;
ALTER TABLE restaurant_order_items ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER line_total;

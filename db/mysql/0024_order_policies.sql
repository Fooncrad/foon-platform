-- Flexible ordering policies per restaurant and per table. Additive only.
CREATE TABLE IF NOT EXISTS restaurant_order_policies (
 tenant_id VARCHAR(36) NOT NULL,
 order_type VARCHAR(30) NOT NULL,
 min_order DECIMAL(12,2) NOT NULL DEFAULT 0,
 service_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
 service_fee_label_ar VARCHAR(160) NULL,
 service_fee_label_en VARCHAR(160) NULL,
 service_fee_label_fr VARCHAR(160) NULL,
 max_active_orders INT NULL,
 requires_driver TINYINT(1) NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id,order_type)
);
CREATE TABLE IF NOT EXISTS restaurant_business_hours (
 tenant_id VARCHAR(36) NOT NULL,
 day_of_week TINYINT NOT NULL,
 open_time VARCHAR(5) NULL,
 close_time VARCHAR(5) NULL,
 closed TINYINT(1) NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id,day_of_week)
);
CREATE TABLE IF NOT EXISTS restaurant_delivery_capacity (
 tenant_id VARCHAR(36) NOT NULL,
 available_drivers INT NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id)
);
ALTER TABLE restaurant_table_runtime ADD COLUMN min_order DECIMAL(12,2) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee DECIMAL(12,2) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee_label_ar VARCHAR(160) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee_label_en VARCHAR(160) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN service_fee_label_fr VARCHAR(160) NULL;

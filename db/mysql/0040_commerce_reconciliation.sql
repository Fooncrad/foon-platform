-- FOON commerce reconciliation pack.
-- Safe additive migration for production databases that may have skipped older module migrations.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS restaurant_promotions (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 name VARCHAR(180) NOT NULL,
 discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
 discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
 starts_at BIGINT NULL,
 ends_at BIGINT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 KEY promotions_tenant_dates(tenant_id,enabled,starts_at,ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_coupons (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 code VARCHAR(80) NOT NULL,
 discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
 discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
 min_order DECIMAL(12,2) NOT NULL DEFAULT 0,
 max_discount DECIMAL(12,2) NULL,
 usage_limit INT NULL,
 per_customer_limit INT NULL,
 used_count INT NOT NULL DEFAULT 0,
 starts_at BIGINT NULL,
 ends_at BIGINT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY coupon_tenant_code(tenant_id,code),
 KEY coupon_tenant_active(tenant_id,enabled,starts_at,ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_coupon_redemptions (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 coupon_id VARCHAR(36) NOT NULL,
 order_id VARCHAR(36) NOT NULL,
 customer_phone VARCHAR(32) NULL,
 discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
 created_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY coupon_redemption_order(coupon_id,order_id),
 KEY coupon_redemption_customer(tenant_id,coupon_id,customer_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_order_discounts (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 order_id VARCHAR(36) NOT NULL,
 source_type VARCHAR(30) NOT NULL,
 source_id VARCHAR(36) NULL,
 code VARCHAR(80) NULL,
 discount_type VARCHAR(20) NOT NULL,
 discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
 discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
 created_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 KEY order_discounts_order(tenant_id,order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_business_hours (
 tenant_id VARCHAR(36) NOT NULL,
 day_of_week TINYINT NOT NULL,
 open_time VARCHAR(5) NULL,
 close_time VARCHAR(5) NULL,
 closed TINYINT(1) NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id,day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_delivery_capacity (
 tenant_id VARCHAR(36) NOT NULL,
 available_drivers INT NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_notification_settings (
 tenant_id VARCHAR(36) NOT NULL,
 event VARCHAR(80) NOT NULL,
 in_app TINYINT(1) NOT NULL DEFAULT 1,
 email TINYINT(1) NOT NULL DEFAULT 1,
 sound TINYINT(1) NOT NULL DEFAULT 1,
 whatsapp TINYINT(1) NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id,event)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

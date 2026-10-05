SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS restaurant_service_charges (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 branch_id VARCHAR(36) NULL,
 service_type VARCHAR(40) NOT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 0,
 charge_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
 charge_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
 minimum_charge DECIMAL(12,2) NULL,
 minimum_order DECIMAL(12,2) NULL,
 label_ar VARCHAR(160) NULL,
 label_en VARCHAR(160) NULL,
 label_fr VARCHAR(160) NULL,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY restaurant_service_charge_scope(tenant_id,branch_id,service_type),
 KEY restaurant_service_charge_tenant(tenant_id,service_type,enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

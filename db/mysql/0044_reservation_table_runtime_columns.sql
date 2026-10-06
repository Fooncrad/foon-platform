-- Align reservation/table operational columns used by the current API.
-- Additive migration for production databases that predate section normalization.
SET NAMES utf8mb4;

ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS section_id VARCHAR(36) NULL AFTER branch_id;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS name VARCHAR(120) NULL AFTER table_number;

CREATE TABLE IF NOT EXISTS restaurant_table_runtime (
 tenant_id VARCHAR(36) NOT NULL, table_id VARCHAR(36) NOT NULL, qr_token VARCHAR(64) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'available', waiter_user_id VARCHAR(36) NULL,
 service_started_at BIGINT NULL, min_order DECIMAL(12,2) NULL, service_fee DECIMAL(12,2) NULL,
 service_fee_label_ar VARCHAR(160) NULL, service_fee_label_en VARCHAR(160) NULL, service_fee_label_fr VARCHAR(160) NULL,
 updated_at BIGINT NOT NULL, PRIMARY KEY(table_id), UNIQUE KEY restaurant_table_runtime_qr(qr_token),
 KEY restaurant_table_runtime_tenant_status(tenant_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE restaurant_table_runtime ADD COLUMN IF NOT EXISTS min_order DECIMAL(12,2) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN IF NOT EXISTS service_fee DECIMAL(12,2) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN IF NOT EXISTS service_fee_label_ar VARCHAR(160) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN IF NOT EXISTS service_fee_label_en VARCHAR(160) NULL;
ALTER TABLE restaurant_table_runtime ADD COLUMN IF NOT EXISTS service_fee_label_fr VARCHAR(160) NULL;

CREATE TABLE IF NOT EXISTS restaurant_table_sections (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NOT NULL,
 name_ar VARCHAR(120) NOT NULL, name_en VARCHAR(120) NOT NULL DEFAULT '', name_fr VARCHAR(120) NOT NULL DEFAULT '',
 enabled TINYINT(1) NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL, PRIMARY KEY(id),
 KEY table_sections_tenant_branch(tenant_id,branch_id,enabled,sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

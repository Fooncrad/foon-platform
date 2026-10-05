-- FOON public restaurant profile, cover, contact and custom pages.
-- Additive migration; does not remove existing tenant data.
ALTER TABLE tenants ADD COLUMN cover_image_url VARCHAR(1000) NULL AFTER status;
ALTER TABLE tenants ADD COLUMN phone VARCHAR(32) NULL AFTER cover_image_url;
ALTER TABLE tenants ADD COLUMN whatsapp VARCHAR(32) NULL AFTER phone;
ALTER TABLE tenants ADD COLUMN email_public VARCHAR(254) NULL AFTER whatsapp;
ALTER TABLE tenants ADD COLUMN address_ar VARCHAR(500) NULL AFTER email_public;
ALTER TABLE tenants ADD COLUMN address_en VARCHAR(500) NULL AFTER address_ar;
ALTER TABLE tenants ADD COLUMN address_fr VARCHAR(500) NULL AFTER address_en;
ALTER TABLE tenants ADD COLUMN about_ar TEXT NULL AFTER address_fr;
ALTER TABLE tenants ADD COLUMN about_en TEXT NULL AFTER about_ar;
ALTER TABLE tenants ADD COLUMN about_fr TEXT NULL AFTER about_en;
ALTER TABLE tenants ADD COLUMN instagram_url VARCHAR(1000) NULL AFTER about_fr;
ALTER TABLE tenants ADD COLUMN tiktok_url VARCHAR(1000) NULL AFTER instagram_url;
ALTER TABLE tenants ADD COLUMN snapchat_url VARCHAR(1000) NULL AFTER tiktok_url;
ALTER TABLE tenants ADD COLUMN website_url VARCHAR(1000) NULL AFTER snapchat_url;
ALTER TABLE tenants ADD COLUMN waiter_call_enabled BIGINT NOT NULL DEFAULT 0 AFTER website_url;

CREATE TABLE IF NOT EXISTS restaurant_public_pages (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 slug VARCHAR(80) NOT NULL,
 title_ar VARCHAR(180) NOT NULL,
 title_en VARCHAR(180) NOT NULL DEFAULT '',
 title_fr VARCHAR(180) NOT NULL DEFAULT '',
 body_ar MEDIUMTEXT NULL,
 body_en MEDIUMTEXT NULL,
 body_fr MEDIUMTEXT NULL,
 sort_order INT NOT NULL DEFAULT 0,
 enabled BIGINT NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY restaurant_public_pages_tenant_slug(tenant_id,slug),
 KEY restaurant_public_pages_tenant_enabled(tenant_id,enabled,sort_order),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_waiter_calls (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 table_reference VARCHAR(80) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'new',
 source VARCHAR(30) NOT NULL DEFAULT 'menu',
 created_at BIGINT NOT NULL,
 acknowledged_at BIGINT NULL,
 completed_at BIGINT NULL,
 PRIMARY KEY(id),
 KEY restaurant_waiter_calls_tenant_status(tenant_id,status,created_at),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

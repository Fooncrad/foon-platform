-- Additive printing/QR/notification settings. Existing operational tables remain unchanged.
CREATE TABLE IF NOT EXISTS restaurant_printers (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, branch_id varchar(36) NULL,
 name varchar(120) NOT NULL, station varchar(60) NOT NULL DEFAULT 'kitchen',
 connection_type varchar(30) NOT NULL DEFAULT 'network', connection_value varchar(500) NULL,
 enabled tinyint(1) NOT NULL DEFAULT 1, created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY printers_tenant (tenant_id), KEY printers_branch (branch_id)
);
CREATE TABLE IF NOT EXISTS restaurant_qr_profiles (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, branch_id varchar(36) NULL,
 label varchar(120) NOT NULL, service_type varchar(40) NOT NULL DEFAULT 'menu',
 reference_value varchar(100) NULL, enabled tinyint(1) NOT NULL DEFAULT 1,
 created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY qr_tenant (tenant_id)
);
CREATE TABLE IF NOT EXISTS restaurant_notification_settings (
 tenant_id varchar(36) NOT NULL, event varchar(80) NOT NULL,
 in_app tinyint(1) NOT NULL DEFAULT 1, email tinyint(1) NOT NULL DEFAULT 1,
 sound tinyint(1) NOT NULL DEFAULT 1, whatsapp tinyint(1) NOT NULL DEFAULT 0,
 updated_at bigint NOT NULL, PRIMARY KEY(tenant_id,event)
);
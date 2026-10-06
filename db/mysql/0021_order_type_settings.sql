-- Per-restaurant public ordering channel controls. Missing rows intentionally mean enabled for backward compatibility.
CREATE TABLE IF NOT EXISTS restaurant_order_type_settings (
 tenant_id varchar(36) NOT NULL,
 order_type varchar(30) NOT NULL,
 enabled tinyint(1) NOT NULL DEFAULT 1,
 updated_at bigint NOT NULL,
 PRIMARY KEY(tenant_id,order_type),
 KEY order_type_settings_tenant (tenant_id)
);

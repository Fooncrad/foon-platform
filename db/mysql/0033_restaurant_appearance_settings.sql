CREATE TABLE IF NOT EXISTS restaurant_appearance_settings (
 tenant_id varchar(36) NOT NULL,
 draft_json longtext NULL,
 published_json longtext NULL,
 updated_at bigint NOT NULL,
 published_at bigint NULL,
 PRIMARY KEY (tenant_id),
 CONSTRAINT fk_restaurant_appearance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

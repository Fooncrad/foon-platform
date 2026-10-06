-- Tenant-owned item sizes, configurable add-on groups and uploaded menu images.
CREATE TABLE IF NOT EXISTS menu_item_variants (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, item_id VARCHAR(36) NOT NULL,
 name_ar VARCHAR(120) NOT NULL, name_en VARCHAR(120) NOT NULL DEFAULT '', name_fr VARCHAR(120) NOT NULL DEFAULT '',
 price_delta DECIMAL(12,2) NOT NULL DEFAULT 0, sort_order INT NOT NULL DEFAULT 0, enabled BIGINT NOT NULL DEFAULT 1,
 PRIMARY KEY(id), KEY menu_variants_item(tenant_id,item_id,enabled,sort_order),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS menu_addon_groups (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, item_id VARCHAR(36) NOT NULL,
 title_ar VARCHAR(160) NOT NULL, title_en VARCHAR(160) NOT NULL DEFAULT '', title_fr VARCHAR(160) NOT NULL DEFAULT '',
 selection_type VARCHAR(12) NOT NULL DEFAULT 'multiple', is_required BIGINT NOT NULL DEFAULT 0,
 min_select INT NOT NULL DEFAULT 0, max_select INT NOT NULL DEFAULT 0, max_qty INT NOT NULL DEFAULT 1,
 sort_order INT NOT NULL DEFAULT 0, enabled BIGINT NOT NULL DEFAULT 1,
 PRIMARY KEY(id), KEY menu_addon_groups_item(tenant_id,item_id,enabled,sort_order),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS menu_addon_options (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, group_id VARCHAR(36) NOT NULL,
 name_ar VARCHAR(160) NOT NULL, name_en VARCHAR(160) NOT NULL DEFAULT '', name_fr VARCHAR(160) NOT NULL DEFAULT '',
 price_delta DECIMAL(12,2) NOT NULL DEFAULT 0, sort_order INT NOT NULL DEFAULT 0, enabled BIGINT NOT NULL DEFAULT 1,
 PRIMARY KEY(id), KEY menu_addon_options_group(tenant_id,group_id,enabled,sort_order),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(group_id) REFERENCES menu_addon_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS menu_addon_library (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL,
 name_ar VARCHAR(160) NOT NULL, name_en VARCHAR(160) NOT NULL DEFAULT '', name_fr VARCHAR(160) NOT NULL DEFAULT '',
 price_delta DECIMAL(12,2) NOT NULL DEFAULT 0, enabled BIGINT NOT NULL DEFAULT 1, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY menu_addon_library_tenant(tenant_id,enabled,name_ar),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS menu_item_images (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, item_id VARCHAR(36) NULL,
 content_type VARCHAR(40) NOT NULL, image_data MEDIUMBLOB NOT NULL, byte_size INT NOT NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY menu_images_tenant_item(tenant_id,item_id),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(item_id) REFERENCES menu_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

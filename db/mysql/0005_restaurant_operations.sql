-- FOON restaurant operations foundation. Non-destructive.
CREATE TABLE IF NOT EXISTS menu_categories (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, name_ar VARCHAR(160) NOT NULL, name_en VARCHAR(160) NOT NULL DEFAULT '', name_fr VARCHAR(160) NOT NULL DEFAULT '', sort_order INT NOT NULL DEFAULT 0, enabled BIGINT NOT NULL DEFAULT 1, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY menu_categories_tenant(tenant_id,enabled,sort_order), FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS menu_items (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, category_id VARCHAR(36) NOT NULL, name_ar VARCHAR(180) NOT NULL, name_en VARCHAR(180) NOT NULL DEFAULT '', name_fr VARCHAR(180) NOT NULL DEFAULT '', description_ar TEXT NULL, description_en TEXT NULL, description_fr TEXT NULL, price DECIMAL(12,2) NOT NULL DEFAULT 0, image_url VARCHAR(1000) NULL, calories INT NULL, enabled BIGINT NOT NULL DEFAULT 1, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY menu_items_tenant_category(tenant_id,category_id,enabled), FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(category_id) REFERENCES menu_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS restaurant_orders (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NOT NULL, reference VARCHAR(40) NOT NULL, source VARCHAR(30) NOT NULL DEFAULT 'menu', status VARCHAR(30) NOT NULL DEFAULT 'new', customer_name VARCHAR(160) NULL, customer_phone VARCHAR(32) NULL, subtotal DECIMAL(12,2) NOT NULL DEFAULT 0, total DECIMAL(12,2) NOT NULL DEFAULT 0, currency VARCHAR(3) NOT NULL, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY restaurant_orders_reference(reference), KEY restaurant_orders_tenant_status(tenant_id,status,created_at), FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS restaurant_order_items (
 id VARCHAR(36) NOT NULL, order_id VARCHAR(36) NOT NULL, menu_item_id VARCHAR(36) NULL, item_name VARCHAR(180) NOT NULL, quantity INT NOT NULL DEFAULT 1, unit_price DECIMAL(12,2) NOT NULL, line_total DECIMAL(12,2) NOT NULL,
 PRIMARY KEY(id), KEY restaurant_order_items_order(order_id), FOREIGN KEY(order_id) REFERENCES restaurant_orders(id), FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

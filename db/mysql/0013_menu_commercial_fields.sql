-- Additive fields for category media, item pricing, tax, inventory and dietary labels.
ALTER TABLE menu_categories ADD COLUMN image_url VARCHAR(1000) NULL;
ALTER TABLE menu_items ADD COLUMN discount_price DECIMAL(12,2) NULL;
ALTER TABLE menu_items ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN tax_included BIGINT NOT NULL DEFAULT 1;
ALTER TABLE menu_items ADD COLUMN stock_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN track_inventory BIGINT NOT NULL DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN dietary_type VARCHAR(24) NOT NULL DEFAULT 'unspecified';
ALTER TABLE menu_items ADD COLUMN sort_order INT NOT NULL DEFAULT 0;
ALTER TABLE menu_item_images ADD COLUMN category_id VARCHAR(36) NULL;
ALTER TABLE menu_item_images ADD KEY menu_images_tenant_category(tenant_id,category_id);
ALTER TABLE menu_item_images ADD CONSTRAINT menu_images_category_fk FOREIGN KEY(category_id) REFERENCES menu_categories(id) ON DELETE SET NULL;
ALTER TABLE restaurant_orders ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE restaurant_order_items ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

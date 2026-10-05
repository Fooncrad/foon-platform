-- Reconcile columns/indexes skipped because 0018 created these tables before 0020.
-- Additive only; based on deterministic migration order.
ALTER TABLE suppliers ADD COLUMN address VARCHAR(500) NULL AFTER tax_number;
ALTER TABLE suppliers ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 AFTER address;
ALTER TABLE purchase_orders ADD COLUMN notes VARCHAR(1000) NULL AFTER total;
ALTER TABLE staff_profiles ADD KEY staff_branch(branch_id);

CREATE TABLE IF NOT EXISTS inventory_movements (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 inventory_item_id VARCHAR(36) NOT NULL, movement_type VARCHAR(30) NOT NULL,
 quantity DECIMAL(14,3) NOT NULL, unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
 reference_type VARCHAR(40) NULL, reference_id VARCHAR(36) NULL, note VARCHAR(500) NULL,
 actor_id VARCHAR(36) NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY inv_move_tenant_item(tenant_id,inventory_item_id,created_at),
 KEY inv_move_reference(reference_type,reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_order_items (
 id VARCHAR(36) NOT NULL, purchase_order_id VARCHAR(36) NOT NULL, inventory_item_id VARCHAR(36) NULL,
 item_name VARCHAR(180) NOT NULL, quantity DECIMAL(14,3) NOT NULL DEFAULT 1,
 unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0, line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
 PRIMARY KEY(id), KEY purchase_items_order(purchase_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_item_inventory (
 tenant_id VARCHAR(36) NOT NULL, menu_item_id VARCHAR(36) NOT NULL, inventory_item_id VARCHAR(36) NOT NULL,
 quantity_required DECIMAL(14,3) NOT NULL DEFAULT 1,
 PRIMARY KEY(tenant_id,menu_item_id,inventory_item_id), KEY menu_inventory_stock(inventory_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_attendance (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, staff_id VARCHAR(36) NOT NULL,
 branch_id VARCHAR(36) NULL, clock_in BIGINT NOT NULL, clock_out BIGINT NULL, note VARCHAR(500) NULL,
 PRIMARY KEY(id), KEY attendance_tenant_staff(tenant_id,staff_id,clock_in)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS printer_routes (
 tenant_id VARCHAR(36) NOT NULL, printer_id VARCHAR(36) NOT NULL,
 route_type VARCHAR(30) NOT NULL, route_value VARCHAR(100) NOT NULL,
 PRIMARY KEY(tenant_id,printer_id,route_type,route_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_promotions (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, name VARCHAR(180) NOT NULL,
 discount_type VARCHAR(20) NOT NULL DEFAULT 'percent', discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
 starts_at BIGINT NULL, ends_at BIGINT NULL, enabled TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY promotions_tenant_dates(tenant_id,enabled,starts_at,ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_coupons (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, code VARCHAR(80) NOT NULL,
 discount_type VARCHAR(20) NOT NULL DEFAULT 'percent', discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
 min_order DECIMAL(12,2) NOT NULL DEFAULT 0, usage_limit INT NULL, used_count INT NOT NULL DEFAULT 0,
 starts_at BIGINT NULL, ends_at BIGINT NULL, enabled TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY coupon_tenant_code(tenant_id,code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_notes (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, customer_phone VARCHAR(32) NULL,
 customer_email VARCHAR(254) NULL, note VARCHAR(1000) NOT NULL, created_by VARCHAR(36) NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY customer_notes_tenant_phone(tenant_id,customer_phone), KEY customer_notes_tenant_email(tenant_id,customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_expenses (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 category VARCHAR(80) NOT NULL, description VARCHAR(300) NOT NULL, amount DECIMAL(12,2) NOT NULL,
 currency VARCHAR(3) NOT NULL, expense_at BIGINT NOT NULL, created_by VARCHAR(36) NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY expenses_tenant_date(tenant_id,expense_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FOON SAFE ADDITIVE DATABASE PACK
-- For an existing FOON database. No DROP / TRUNCATE / destructive changes.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS inventory_items (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 name VARCHAR(180) NOT NULL, sku VARCHAR(80) NULL, unit VARCHAR(30) NOT NULL DEFAULT 'unit',
 quantity DECIMAL(14,3) NOT NULL DEFAULT 0, reorder_level DECIMAL(14,3) NOT NULL DEFAULT 0,
 cost DECIMAL(12,2) NOT NULL DEFAULT 0, active TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY inventory_tenant(tenant_id), KEY inventory_branch(branch_id),
 UNIQUE KEY inventory_tenant_sku(tenant_id,sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 inventory_item_id VARCHAR(36) NOT NULL, movement_type VARCHAR(30) NOT NULL,
 quantity DECIMAL(14,3) NOT NULL, unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
 reference_type VARCHAR(40) NULL, reference_id VARCHAR(36) NULL, note VARCHAR(500) NULL,
 actor_id VARCHAR(36) NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY inv_move_tenant_item(tenant_id,inventory_item_id,created_at),
 KEY inv_move_reference(reference_type,reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, name VARCHAR(180) NOT NULL,
 phone VARCHAR(40) NULL, email VARCHAR(254) NULL, tax_number VARCHAR(80) NULL,
 address VARCHAR(500) NULL, active TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY suppliers_tenant(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_orders (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 supplier_id VARCHAR(36) NULL, reference VARCHAR(50) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'draft',
 subtotal DECIMAL(12,2) NOT NULL DEFAULT 0, tax DECIMAL(12,2) NOT NULL DEFAULT 0,
 total DECIMAL(12,2) NOT NULL DEFAULT 0, notes VARCHAR(1000) NULL,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY purchase_reference(tenant_id,reference),
 KEY purchase_tenant_status(tenant_id,status)
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
 PRIMARY KEY(tenant_id,menu_item_id,inventory_item_id),
 KEY menu_inventory_stock(inventory_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_profiles (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, user_id VARCHAR(36) NULL, branch_id VARCHAR(36) NULL,
 name VARCHAR(180) NOT NULL, email VARCHAR(254) NULL, phone VARCHAR(40) NULL,
 role VARCHAR(40) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'active',
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY staff_tenant(tenant_id), KEY staff_user(user_id), KEY staff_branch(branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
 tenant_id VARCHAR(36) NOT NULL, role VARCHAR(40) NOT NULL, permission_key VARCHAR(100) NOT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 1,
 PRIMARY KEY(tenant_id,role,permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_attendance (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, staff_id VARCHAR(36) NOT NULL,
 branch_id VARCHAR(36) NULL, clock_in BIGINT NOT NULL, clock_out BIGINT NULL, note VARCHAR(500) NULL,
 PRIMARY KEY(id), KEY attendance_tenant_staff(tenant_id,staff_id,clock_in)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_printers (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 name VARCHAR(120) NOT NULL, station VARCHAR(60) NOT NULL DEFAULT 'kitchen',
 connection_type VARCHAR(30) NOT NULL DEFAULT 'network', connection_value VARCHAR(500) NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 1, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY printers_tenant(tenant_id), KEY printers_branch(branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS printer_routes (
 tenant_id VARCHAR(36) NOT NULL, printer_id VARCHAR(36) NOT NULL,
 route_type VARCHAR(30) NOT NULL, route_value VARCHAR(100) NOT NULL,
 PRIMARY KEY(tenant_id,printer_id,route_type,route_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_qr_profiles (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 label VARCHAR(120) NOT NULL, service_type VARCHAR(40) NOT NULL DEFAULT 'menu',
 reference_value VARCHAR(100) NULL, enabled TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY qr_tenant(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_notification_settings (
 tenant_id VARCHAR(36) NOT NULL, event VARCHAR(80) NOT NULL,
 in_app TINYINT(1) NOT NULL DEFAULT 1, email TINYINT(1) NOT NULL DEFAULT 1,
 sound TINYINT(1) NOT NULL DEFAULT 1, whatsapp TINYINT(1) NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL, PRIMARY KEY(tenant_id,event)
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
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL,
 customer_phone VARCHAR(32) NULL, customer_email VARCHAR(254) NULL,
 note VARCHAR(1000) NOT NULL, created_by VARCHAR(36) NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY customer_notes_tenant_phone(tenant_id,customer_phone),
 KEY customer_notes_tenant_email(tenant_id,customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_expenses (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 category VARCHAR(80) NOT NULL, description VARCHAR(300) NOT NULL,
 amount DECIMAL(12,2) NOT NULL, currency VARCHAR(3) NOT NULL,
 expense_at BIGINT NOT NULL, created_by VARCHAR(36) NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(id), KEY expenses_tenant_date(tenant_id,expense_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;

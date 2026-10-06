-- Additive restaurant management modules. No existing table or column is altered.
CREATE TABLE IF NOT EXISTS inventory_items (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, branch_id varchar(36) NULL,
 name varchar(180) NOT NULL, sku varchar(80) NULL, unit varchar(30) NOT NULL DEFAULT 'unit',
 quantity decimal(14,3) NOT NULL DEFAULT 0, reorder_level decimal(14,3) NOT NULL DEFAULT 0,
 cost decimal(12,2) NOT NULL DEFAULT 0, active tinyint(1) NOT NULL DEFAULT 1,
 created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY inventory_tenant (tenant_id), KEY inventory_branch (branch_id)
);
CREATE TABLE IF NOT EXISTS suppliers (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, name varchar(180) NOT NULL,
 phone varchar(40) NULL, email varchar(254) NULL, tax_number varchar(80) NULL,
 created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY suppliers_tenant (tenant_id)
);
CREATE TABLE IF NOT EXISTS purchase_orders (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, branch_id varchar(36) NULL,
 supplier_id varchar(36) NULL, reference varchar(50) NOT NULL, status varchar(30) NOT NULL DEFAULT 'draft',
 subtotal decimal(12,2) NOT NULL DEFAULT 0, tax decimal(12,2) NOT NULL DEFAULT 0, total decimal(12,2) NOT NULL DEFAULT 0,
 created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY purchase_reference (tenant_id,reference), KEY purchase_tenant_status (tenant_id,status)
);
CREATE TABLE IF NOT EXISTS staff_profiles (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, user_id varchar(36) NULL, branch_id varchar(36) NULL,
 name varchar(180) NOT NULL, email varchar(254) NULL, phone varchar(40) NULL, role varchar(40) NOT NULL,
 status varchar(30) NOT NULL DEFAULT 'active', created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY staff_tenant (tenant_id), KEY staff_user (user_id)
);
CREATE TABLE IF NOT EXISTS role_permissions (
 tenant_id varchar(36) NOT NULL, role varchar(40) NOT NULL, permission_key varchar(100) NOT NULL,
 enabled tinyint(1) NOT NULL DEFAULT 1,
 PRIMARY KEY(tenant_id,role,permission_key)
);

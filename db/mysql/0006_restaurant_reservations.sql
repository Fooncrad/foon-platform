-- Restaurant reservations and tables. Additive/non-destructive.
CREATE TABLE IF NOT EXISTS restaurant_tables (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NOT NULL,
 table_number VARCHAR(40) NOT NULL, section_name VARCHAR(120) NOT NULL DEFAULT '', capacity INT NOT NULL DEFAULT 2,
 enabled BIGINT NOT NULL DEFAULT 1, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY restaurant_tables_branch_number(branch_id,table_number),
 KEY restaurant_tables_tenant(tenant_id,enabled),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_reservations (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NOT NULL, table_id VARCHAR(36) NULL,
 reference VARCHAR(40) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'pending',
 customer_name VARCHAR(160) NOT NULL, customer_email VARCHAR(255) NULL, customer_phone VARCHAR(32) NULL,
 guests INT NOT NULL DEFAULT 1, reservation_at BIGINT NOT NULL, notes VARCHAR(1000) NULL,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY restaurant_reservations_reference(reference),
 KEY restaurant_reservations_tenant_time(tenant_id,reservation_at,status),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(branch_id) REFERENCES branches(id),
 FOREIGN KEY(table_id) REFERENCES restaurant_tables(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

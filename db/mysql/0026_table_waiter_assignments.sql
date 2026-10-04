-- Additive mapping between restaurant tables and staff_profiles waiters.
CREATE TABLE IF NOT EXISTS restaurant_table_waiter_assignments (
 tenant_id VARCHAR(36) NOT NULL,
 table_id VARCHAR(36) NOT NULL,
 staff_id VARCHAR(36) NOT NULL,
 assigned_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(table_id),
 KEY restaurant_table_waiter_tenant_staff(tenant_id,staff_id),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id),
 FOREIGN KEY(table_id) REFERENCES restaurant_tables(id),
 FOREIGN KEY(staff_id) REFERENCES staff_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Additive table operations extension: occupancy, QR and waiter assignment.
CREATE TABLE IF NOT EXISTS restaurant_table_runtime (
 tenant_id VARCHAR(36) NOT NULL,
 table_id VARCHAR(36) NOT NULL,
 qr_token VARCHAR(64) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'available',
 waiter_user_id VARCHAR(36) NULL,
 service_started_at BIGINT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(table_id),
 UNIQUE KEY restaurant_table_runtime_qr(qr_token),
 KEY restaurant_table_runtime_tenant_status(tenant_id,status),
 KEY restaurant_table_runtime_waiter(tenant_id,waiter_user_id),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id),
 FOREIGN KEY(table_id) REFERENCES restaurant_tables(id),
 FOREIGN KEY(waiter_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

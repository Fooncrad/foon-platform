-- Additive waiter-call/service log for table operations.
CREATE TABLE IF NOT EXISTS restaurant_table_service_events (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 table_id VARCHAR(36) NOT NULL,
 waiter_id VARCHAR(36) NULL,
 event_type VARCHAR(30) NOT NULL,
 reason VARCHAR(500) NULL,
 source VARCHAR(30) NOT NULL DEFAULT 'menu',
 created_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 KEY table_service_events_tenant_table(tenant_id,table_id,created_at),
 KEY table_service_events_waiter(tenant_id,waiter_id,created_at),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id),
 FOREIGN KEY(table_id) REFERENCES restaurant_tables(id),
 FOREIGN KEY(waiter_id) REFERENCES staff_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Reconcile columns used by current table-service API.
ALTER TABLE restaurant_table_service_events ADD COLUMN IF NOT EXISTS actor_id VARCHAR(36) NULL AFTER table_id;
ALTER TABLE restaurant_table_service_events ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT 'menu' AFTER reason;

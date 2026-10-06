-- Idempotent inventory consumption ledger for restaurant orders.
CREATE TABLE IF NOT EXISTS order_inventory_consumptions (
 order_id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, consumed_at BIGINT NOT NULL,
 PRIMARY KEY(order_id), KEY order_inventory_tenant(tenant_id,consumed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
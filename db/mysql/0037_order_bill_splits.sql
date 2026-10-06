CREATE TABLE IF NOT EXISTS restaurant_order_splits (
  id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  split_index INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
  paid_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY order_split_index (order_id,split_index),
  KEY order_splits_tenant (tenant_id,order_id),
  CONSTRAINT fk_order_splits_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_splits_order FOREIGN KEY (order_id) REFERENCES restaurant_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

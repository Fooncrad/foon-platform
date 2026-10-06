CREATE TABLE IF NOT EXISTS email_delivery_logs (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  scope_type VARCHAR(24) NOT NULL DEFAULT 'platform',
  tenant_id VARCHAR(36) NULL,
  activity_id VARCHAR(64) NULL,
  operation VARCHAR(32) NOT NULL,
  recipient VARCHAR(254) NULL,
  status VARCHAR(24) NOT NULL,
  error_code VARCHAR(120) NULL,
  created_at BIGINT NOT NULL,
  INDEX email_delivery_logs_scope_created (scope_type, created_at),
  INDEX email_delivery_logs_tenant_created (tenant_id, created_at),
  INDEX email_delivery_logs_activity_created (activity_id, created_at),
  INDEX email_delivery_logs_status_created (status, created_at)
);

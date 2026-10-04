-- Additive waiter-call preferences per restaurant.
CREATE TABLE IF NOT EXISTS restaurant_waiter_call_settings (
 tenant_id VARCHAR(36) NOT NULL,
 cooldown_minutes INT NOT NULL DEFAULT 20,
 alert_mode VARCHAR(20) NOT NULL DEFAULT 'both',
 in_app_enabled BIGINT NOT NULL DEFAULT 1,
 email_enabled BIGINT NOT NULL DEFAULT 1,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

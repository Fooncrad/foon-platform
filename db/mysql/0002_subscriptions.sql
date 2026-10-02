CREATE TABLE IF NOT EXISTS tenant_profiles (
 tenant_id VARCHAR(36) NOT NULL,
 phone VARCHAR(32) NOT NULL DEFAULT '',
 city VARCHAR(120) NOT NULL DEFAULT '',
 updated_at BIGINT NOT NULL,
 PRIMARY KEY (tenant_id),
 FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS package_plans (
 id VARCHAR(40) NOT NULL,
 name_ar VARCHAR(120) NOT NULL,
 name_en VARCHAR(120) NOT NULL,
 monthly_price DECIMAL(12,2) NOT NULL DEFAULT 0,
 currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
 enabled BIGINT NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL,
 PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 plan_id VARCHAR(40) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'pending',
 starts_at BIGINT NULL,
 expires_at BIGINT NULL,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY (id),
 KEY subscriptions_tenant_status (tenant_id,status),
 FOREIGN KEY (tenant_id) REFERENCES tenants(id),
 FOREIGN KEY (plan_id) REFERENCES package_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_requests (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 subscription_id VARCHAR(36) NOT NULL,
 method VARCHAR(30) NOT NULL DEFAULT 'bank_transfer',
 amount DECIMAL(12,2) NOT NULL,
 currency VARCHAR(3) NOT NULL,
 transaction_reference VARCHAR(160) NOT NULL,
 receipt_url VARCHAR(1000) NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'pending',
 submitted_at BIGINT NOT NULL,
 reviewed_at BIGINT NULL,
 reviewed_by VARCHAR(36) NULL,
 review_note VARCHAR(1000) NULL,
 PRIMARY KEY (id),
 KEY payments_tenant_status (tenant_id,status),
 UNIQUE KEY payment_reference_unique (transaction_reference),
 FOREIGN KEY (tenant_id) REFERENCES tenants(id),
 FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
 FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO package_plans(id,name_ar,name_en,monthly_price,currency,enabled,created_at) VALUES
 ('starter','البداية','Starter',0,'SAR',1,UNIX_TIMESTAMP()*1000),
 ('business','الأعمال','Business',399.00,'SAR',1,UNIX_TIMESTAMP()*1000);

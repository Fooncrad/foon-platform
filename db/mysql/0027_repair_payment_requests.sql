-- Repair payment requests for installations whose subscription tables were partially imported.
-- Additive and safe to run on databases where the table already exists.
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
 CONSTRAINT payment_requests_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id),
 CONSTRAINT payment_requests_subscription_fk FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
 CONSTRAINT payment_requests_reviewer_fk FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

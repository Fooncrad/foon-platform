-- FOON reservation/waitlist upgrade. Additive and tenant-scoped.
CREATE TABLE IF NOT EXISTS restaurant_reservation_settings (
 tenant_id VARCHAR(36) NOT NULL,
 advance_days INT NOT NULL DEFAULT 7,
 reservation_grace_minutes INT NOT NULL DEFAULT 15,
 waitlist_expiry_minutes INT NOT NULL DEFAULT 120,
 waiting_grace_minutes INT NOT NULL DEFAULT 5,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_reservation_slots (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 branch_id VARCHAR(36) NOT NULL,
 day_of_week INT NOT NULL,
 start_time VARCHAR(5) NOT NULL,
 end_time VARCHAR(5) NOT NULL,
 slot_duration_minutes INT NOT NULL DEFAULT 30,
 enabled BIGINT NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 KEY reservation_slots_tenant_day(tenant_id,branch_id,day_of_week,enabled),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id),
 FOREIGN KEY(branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_waitlist (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 branch_id VARCHAR(36) NOT NULL,
 table_id VARCHAR(36) NULL,
 reference VARCHAR(40) NOT NULL,
 display_number VARCHAR(12) NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'waiting',
 customer_name VARCHAR(160) NOT NULL,
 customer_phone VARCHAR(32) NOT NULL,
 guests INT NOT NULL DEFAULT 1,
 notes VARCHAR(1000) NULL,
 accepted_at BIGINT NULL,
 seated_at BIGINT NULL,
 expires_at BIGINT NOT NULL,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY restaurant_waitlist_reference(reference),
 KEY restaurant_waitlist_tenant_status(tenant_id,status,created_at),
 KEY restaurant_waitlist_phone(tenant_id,customer_phone,status),
 FOREIGN KEY(tenant_id) REFERENCES tenants(id),
 FOREIGN KEY(branch_id) REFERENCES branches(id),
 FOREIGN KEY(table_id) REFERENCES restaurant_tables(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

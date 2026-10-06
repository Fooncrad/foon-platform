-- FOON operational reconciliation pack.
-- Recreates missing reservation/waitlist/table support tables without destructive changes.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS restaurant_reservation_settings (
 tenant_id VARCHAR(36) NOT NULL,
 reservations_enabled TINYINT(1) NOT NULL DEFAULT 1,
 waitlist_enabled TINYINT(1) NOT NULL DEFAULT 1,
 advance_days INT NOT NULL DEFAULT 7,
 reservation_grace_minutes INT NOT NULL DEFAULT 15,
 waitlist_expiry_minutes INT NOT NULL DEFAULT 120,
 waiting_grace_minutes INT NOT NULL DEFAULT 5,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id)
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
 KEY reservation_slots_tenant_day(tenant_id,branch_id,day_of_week,enabled)
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
 customer_phone VARCHAR(40) NOT NULL,
 customer_email VARCHAR(254) NULL,
 guest_count INT NOT NULL DEFAULT 1,
 guests INT NOT NULL DEFAULT 1,
 section_id VARCHAR(36) NULL,
 assigned_table_id VARCHAR(36) NULL,
 accepted_at BIGINT NULL,
 completed_at BIGINT NULL,
 cancelled_at BIGINT NULL,
 cancellation_reason VARCHAR(500) NULL,
 expires_at BIGINT NULL,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY restaurant_waitlist_reference(reference),
 KEY restaurant_waitlist_tenant_status(tenant_id,status,created_at),
 KEY restaurant_waitlist_phone(tenant_id,customer_phone,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_table_sections (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NOT NULL,
 branch_id VARCHAR(36) NOT NULL,
 name_ar VARCHAR(120) NOT NULL,
 name_en VARCHAR(120) NOT NULL DEFAULT '',
 name_fr VARCHAR(120) NOT NULL DEFAULT '',
 enabled TINYINT(1) NOT NULL DEFAULT 1,
 sort_order INT NOT NULL DEFAULT 0,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 KEY table_sections_tenant_branch(tenant_id,branch_id,enabled,sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_waiter_call_settings (
 tenant_id VARCHAR(36) NOT NULL,
 cooldown_minutes INT NOT NULL DEFAULT 20,
 alert_mode VARCHAR(20) NOT NULL DEFAULT 'both',
 in_app_enabled TINYINT(1) NOT NULL DEFAULT 1,
 email_enabled TINYINT(1) NOT NULL DEFAULT 1,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_table_waiter_assignments (
 tenant_id VARCHAR(36) NOT NULL,
 table_id VARCHAR(36) NOT NULL,
 staff_id VARCHAR(36) NOT NULL,
 assigned_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id,table_id),
 KEY waiter_assignment_staff(tenant_id,staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

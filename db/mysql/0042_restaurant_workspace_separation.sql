-- FOON restaurant workspace separation reconciliation.
-- Additive only: restaurant identity, printing/QR, reservations/waitlist/tables/waiter remain independent.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS restaurant_printers (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, branch_id varchar(36) NULL,
 name varchar(120) NOT NULL, station varchar(60) NOT NULL DEFAULT 'kitchen',
 connection_type varchar(30) NOT NULL DEFAULT 'network', connection_value varchar(500) NULL,
 enabled tinyint(1) NOT NULL DEFAULT 1, created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY printers_tenant (tenant_id), KEY printers_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_qr_profiles (
 id varchar(36) NOT NULL, tenant_id varchar(36) NOT NULL, branch_id varchar(36) NULL,
 label varchar(120) NOT NULL, service_type varchar(40) NOT NULL DEFAULT 'menu',
 reference_value varchar(100) NULL, enabled tinyint(1) NOT NULL DEFAULT 1,
 created_at bigint NOT NULL, updated_at bigint NOT NULL,
 PRIMARY KEY(id), KEY qr_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_waiter_call_settings (
 tenant_id varchar(36) NOT NULL, cooldown_minutes int NOT NULL DEFAULT 20,
 alert_mode varchar(20) NOT NULL DEFAULT 'both', in_app_enabled tinyint(1) NOT NULL DEFAULT 1,
 email_enabled tinyint(1) NOT NULL DEFAULT 1, updated_at bigint NOT NULL, PRIMARY KEY(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_table_waiter_assignments (
 tenant_id varchar(36) NOT NULL, table_id varchar(36) NOT NULL, staff_id varchar(36) NOT NULL,
 assigned_at bigint NOT NULL, updated_at bigint NOT NULL, PRIMARY KEY(tenant_id,table_id),
 KEY waiter_assignment_staff(tenant_id,staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restaurant_reservation_settings (
 tenant_id varchar(36) NOT NULL, reservations_enabled tinyint(1) NOT NULL DEFAULT 1,
 waitlist_enabled tinyint(1) NOT NULL DEFAULT 1, advance_days int NOT NULL DEFAULT 7,
 reservation_grace_minutes int NOT NULL DEFAULT 15, waiting_grace_minutes int NOT NULL DEFAULT 5,
 waitlist_expiry_minutes int NOT NULL DEFAULT 120, min_party_size int NOT NULL DEFAULT 1,
 max_party_size int NOT NULL DEFAULT 20, updated_at bigint NOT NULL, PRIMARY KEY(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FOON: MySQL foundation for a NEW dedicated database. No existing data is imported.

CREATE TABLE IF NOT EXISTS `users` (
 `id` VARCHAR(36) NOT NULL,
 `email` VARCHAR(254) NOT NULL,
 `display_name` VARCHAR(160) NOT NULL,
 `platform_role` VARCHAR(40) NOT NULL DEFAULT 'viewer',
 `created_at` BIGINT NOT NULL,
 `password_hash` VARCHAR(255) NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenants` (
 `id` VARCHAR(36) NOT NULL,
 `name` VARCHAR(160) NOT NULL,
 `slug` VARCHAR(60) NOT NULL,
 `activity_id` VARCHAR(60) NOT NULL,
 `country_code` VARCHAR(2) NOT NULL,
 `currency` VARCHAR(3) NOT NULL,
 `status` VARCHAR(40) NOT NULL DEFAULT 'draft',
 `created_by` VARCHAR(36) NOT NULL,
 `created_at` BIGINT NOT NULL,
 PRIMARY KEY (`id`),
 KEY `tenants_country_status` (`country_code`,`status`),
 UNIQUE KEY `tenants_slug_unique` (`slug`),
 FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branches` (
 `id` VARCHAR(36) NOT NULL,
 `tenant_id` VARCHAR(36) NOT NULL,
 `name` VARCHAR(160) NOT NULL,
 `is_primary` BIGINT NOT NULL DEFAULT false,
 PRIMARY KEY (`id`),
 KEY `branches_tenant` (`tenant_id`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `memberships` (
 `tenant_id` VARCHAR(36) NOT NULL,
 `user_id` VARCHAR(36) NOT NULL,
 `role` VARCHAR(40) NOT NULL,
 PRIMARY KEY (`tenant_id`,`user_id`),
 KEY `memberships_user` (`user_id`),
 FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `platform_settings` (
 `key` VARCHAR(120) NOT NULL,
 `value` TEXT NOT NULL,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `platform_message_templates` (
 `event` VARCHAR(80) NOT NULL,
 `locale` VARCHAR(2) NOT NULL,
 `subject` VARCHAR(300) NOT NULL,
 `body` MEDIUMTEXT NOT NULL,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`event`,`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_message_templates` (
 `tenant_id` VARCHAR(36) NOT NULL,
 `event` VARCHAR(80) NOT NULL,
 `locale` VARCHAR(2) NOT NULL,
 `subject` VARCHAR(300) NOT NULL,
 `body` MEDIUMTEXT NOT NULL,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`tenant_id`,`event`,`locale`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `platform_email_settings` (
 `id` VARCHAR(36) NOT NULL,
 `provider` VARCHAR(40) NOT NULL DEFAULT 'resend',
 `from_email` VARCHAR(254) NOT NULL DEFAULT '',
 `from_name` VARCHAR(160) NOT NULL DEFAULT '',
 `secret_ciphertext` TEXT,
 `enabled` BIGINT NOT NULL DEFAULT false,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_email_settings` (
 `tenant_id` VARCHAR(36) NOT NULL,
 `mode` VARCHAR(20) NOT NULL DEFAULT 'platform',
 `provider` VARCHAR(40) NOT NULL DEFAULT 'resend',
 `from_email` VARCHAR(254) NOT NULL DEFAULT '',
 `from_name` VARCHAR(160) NOT NULL DEFAULT '',
 `secret_ciphertext` TEXT,
 `enabled` BIGINT NOT NULL DEFAULT false,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`tenant_id`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `platform_payment_settings` (
 `id` VARCHAR(36) NOT NULL,
 `provider` VARCHAR(40) NOT NULL,
 `public_key` VARCHAR(500) NOT NULL DEFAULT '',
 `secret_ciphertext` TEXT,
 `enabled` BIGINT NOT NULL DEFAULT false,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_payment_settings` (
 `tenant_id` VARCHAR(36) NOT NULL,
 `provider` VARCHAR(40) NOT NULL,
 `public_key` VARCHAR(500) NOT NULL DEFAULT '',
 `secret_ciphertext` TEXT,
 `enabled` BIGINT NOT NULL DEFAULT false,
 `updated_at` BIGINT NOT NULL,
 PRIMARY KEY (`tenant_id`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `message_outbox` (
 `id` VARCHAR(36) NOT NULL,
 `tenant_id` VARCHAR(36),
 `event` VARCHAR(80) NOT NULL,
 `locale` VARCHAR(2) NOT NULL,
 `recipient` VARCHAR(254) NOT NULL,
 `subject` VARCHAR(300) NOT NULL,
 `body` MEDIUMTEXT NOT NULL,
 `status` VARCHAR(40) NOT NULL DEFAULT 'pending',
 `idempotency_key` VARCHAR(256) NOT NULL,
 `created_at` BIGINT NOT NULL,
 PRIMARY KEY (`id`),
 KEY `outbox_tenant_status` (`tenant_id`,`status`),
 UNIQUE KEY `outbox_idempotency_unique` (`idempotency_key`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_events` (
 `id` VARCHAR(36) NOT NULL,
 `actor_id` VARCHAR(36) NOT NULL,
 `tenant_id` VARCHAR(36),
 `action` VARCHAR(120) NOT NULL,
 `created_at` BIGINT NOT NULL,
 PRIMARY KEY (`id`),
 KEY `audit_created` (`created_at`),
 FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
 FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id VARCHAR(36) NOT NULL,
 expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL,
 KEY sessions_expiry(expires_at), FOREIGN KEY(user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_login_attempts (
 bucket_key CHAR(64) PRIMARY KEY, attempts INT NOT NULL,
 expires_at BIGINT NOT NULL, KEY attempts_expiry(expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

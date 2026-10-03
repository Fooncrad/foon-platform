CREATE TABLE IF NOT EXISTS activity_email_settings (
 activity_id VARCHAR(60) NOT NULL,
 provider VARCHAR(40) NOT NULL DEFAULT 'resend',
 from_email VARCHAR(254) NOT NULL DEFAULT '',
 from_name VARCHAR(160) NOT NULL DEFAULT '',
 secret_ciphertext TEXT NULL,
 enabled BIGINT NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_message_templates (
 activity_id VARCHAR(60) NOT NULL,
 event VARCHAR(80) NOT NULL,
 locale VARCHAR(2) NOT NULL,
 subject VARCHAR(300) NOT NULL,
 body MEDIUMTEXT NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY (activity_id,event,locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
 token_hash CHAR(64) NOT NULL,
 user_id VARCHAR(36) NOT NULL,
 expires_at BIGINT NOT NULL,
 used_at BIGINT NULL,
 created_at BIGINT NOT NULL,
 PRIMARY KEY (token_hash),
 KEY password_reset_user(user_id,expires_at),
 KEY password_reset_expiry(expires_at),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_password_reset_attempts (
 bucket_key CHAR(64) NOT NULL,
 attempts INT NOT NULL,
 expires_at BIGINT NOT NULL,
 PRIMARY KEY (bucket_key),
 KEY reset_attempts_expiry(expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

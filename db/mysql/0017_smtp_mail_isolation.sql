ALTER TABLE platform_email_settings
 ADD COLUMN smtp_host VARCHAR(255) NOT NULL DEFAULT '',
 ADD COLUMN smtp_port INT NOT NULL DEFAULT 587,
 ADD COLUMN smtp_secure TINYINT NOT NULL DEFAULT 0,
 ADD COLUMN smtp_username VARCHAR(254) NOT NULL DEFAULT '',
 ADD COLUMN smtp_last_test_at BIGINT NULL,
 ADD COLUMN smtp_last_test_status VARCHAR(24) NOT NULL DEFAULT 'not_tested';

ALTER TABLE tenant_email_settings
 ADD COLUMN smtp_host VARCHAR(255) NOT NULL DEFAULT '',
 ADD COLUMN smtp_port INT NOT NULL DEFAULT 587,
 ADD COLUMN smtp_secure TINYINT NOT NULL DEFAULT 0,
 ADD COLUMN smtp_username VARCHAR(254) NOT NULL DEFAULT '',
 ADD COLUMN smtp_last_test_at BIGINT NULL,
 ADD COLUMN smtp_last_test_status VARCHAR(24) NOT NULL DEFAULT 'not_tested';

ALTER TABLE activity_email_settings
 ADD COLUMN smtp_host VARCHAR(255) NOT NULL DEFAULT '',
 ADD COLUMN smtp_port INT NOT NULL DEFAULT 587,
 ADD COLUMN smtp_secure TINYINT NOT NULL DEFAULT 0,
 ADD COLUMN smtp_username VARCHAR(254) NOT NULL DEFAULT '',
 ADD COLUMN smtp_last_test_at BIGINT NULL,
 ADD COLUMN smtp_last_test_status VARCHAR(24) NOT NULL DEFAULT 'not_tested';

UPDATE platform_email_settings SET provider='smtp',secret_ciphertext=NULL,enabled=0;
UPDATE tenant_email_settings SET mode='custom',provider='smtp',secret_ciphertext=NULL,enabled=0;
UPDATE activity_email_settings SET provider='smtp',secret_ciphertext=NULL,enabled=0;
\nALTER TABLE restaurant_orders ADD COLUMN customer_locale VARCHAR(2) NOT NULL DEFAULT 'ar';\n\nALTER TABLE platform_email_settings ALTER COLUMN provider SET DEFAULT 'smtp';\nALTER TABLE tenant_email_settings ALTER COLUMN provider SET DEFAULT 'smtp';\nALTER TABLE activity_email_settings ALTER COLUMN provider SET DEFAULT 'smtp';\nALTER TABLE tenant_email_settings ALTER COLUMN mode SET DEFAULT 'custom';\n
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS restaurant_reservation_settings (
 tenant_id VARCHAR(36) NOT NULL,
 reservations_enabled TINYINT(1) NOT NULL DEFAULT 1,
 waitlist_enabled TINYINT(1) NOT NULL DEFAULT 1,
 advance_days INT NOT NULL DEFAULT 7,
 reservation_grace_minutes INT NOT NULL DEFAULT 15,
 waiting_grace_minutes INT NOT NULL DEFAULT 5,
 waitlist_expiry_minutes INT NOT NULL DEFAULT 120,
 min_party_size INT NOT NULL DEFAULT 1,
 max_party_size INT NOT NULL DEFAULT 50,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE restaurant_reservations ADD COLUMN guest_count INT NOT NULL DEFAULT 1;
ALTER TABLE restaurant_reservations ADD COLUMN reservation_date DATE NULL;
ALTER TABLE restaurant_reservations ADD COLUMN start_time TIME NULL;
ALTER TABLE restaurant_reservations ADD COLUMN table_id VARCHAR(36) NULL;
ALTER TABLE restaurant_reservations ADD COLUMN updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE restaurant_waitlist ADD COLUMN guest_count INT NOT NULL DEFAULT 1;
ALTER TABLE restaurant_waitlist ADD COLUMN assigned_table_id VARCHAR(36) NULL;
ALTER TABLE restaurant_waitlist ADD COLUMN expires_at BIGINT NULL;
ALTER TABLE restaurant_waitlist ADD COLUMN accepted_at BIGINT NULL;
ALTER TABLE restaurant_waitlist ADD COLUMN completed_at BIGINT NULL;
ALTER TABLE restaurant_waitlist ADD COLUMN cancelled_at BIGINT NULL;
ALTER TABLE restaurant_waitlist ADD COLUMN updated_at BIGINT NOT NULL DEFAULT 0;
UPDATE restaurant_reservations SET guest_count=guests WHERE (guest_count IS NULL OR guest_count=1) AND guests IS NOT NULL AND guests>1;
UPDATE restaurant_reservations SET reservation_date=FROM_UNIXTIME(reservation_at/1000,'%Y-%m-%d'),start_time=FROM_UNIXTIME(reservation_at/1000,'%H:%i:%s') WHERE reservation_at IS NOT NULL AND reservation_at>0 AND reservation_date IS NULL;
UPDATE restaurant_waitlist SET guest_count=guests WHERE (guest_count IS NULL OR guest_count=1) AND guests IS NOT NULL AND guests>1;

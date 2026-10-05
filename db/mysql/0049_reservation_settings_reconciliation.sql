SET NAMES utf8mb4;
ALTER TABLE restaurant_reservation_settings ADD COLUMN min_advance_hours INT NOT NULL DEFAULT 24;
ALTER TABLE restaurant_reservation_settings ADD COLUMN late_cancel_minutes INT NOT NULL DEFAULT 30;

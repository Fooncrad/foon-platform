-- Reconcile table-service operational columns required by the current API.
SET NAMES utf8mb4;

ALTER TABLE restaurant_table_service_events
 ADD COLUMN IF NOT EXISTS actor_id VARCHAR(36) NULL AFTER table_id;

ALTER TABLE restaurant_table_service_events
 ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT 'menu' AFTER reason;

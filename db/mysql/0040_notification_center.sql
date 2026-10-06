-- FOON unified notification center. Additive and tenant-safe.
CREATE TABLE IF NOT EXISTS platform_notification_settings (
 event VARCHAR(80) NOT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 1,
 in_app TINYINT(1) NOT NULL DEFAULT 1,
 browser_push TINYINT(1) NOT NULL DEFAULT 1,
 email TINYINT(1) NOT NULL DEFAULT 1,
 sound TINYINT(1) NOT NULL DEFAULT 1,
 sound_key VARCHAR(60) NOT NULL DEFAULT 'default',
 volume INT NOT NULL DEFAULT 80,
 priority VARCHAR(20) NOT NULL DEFAULT 'normal',
 repeat_count INT NOT NULL DEFAULT 1,
 recipient_roles VARCHAR(500) NOT NULL DEFAULT 'owner,manager',
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(event)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE restaurant_notification_settings ADD COLUMN browser_push TINYINT(1) NOT NULL DEFAULT 1 AFTER in_app;
ALTER TABLE restaurant_notification_settings ADD COLUMN sound_key VARCHAR(60) NOT NULL DEFAULT 'default' AFTER sound;
ALTER TABLE restaurant_notification_settings ADD COLUMN volume INT NOT NULL DEFAULT 80 AFTER sound_key;
ALTER TABLE restaurant_notification_settings ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'normal' AFTER volume;
ALTER TABLE restaurant_notification_settings ADD COLUMN repeat_count INT NOT NULL DEFAULT 1 AFTER priority;
ALTER TABLE restaurant_notification_settings ADD COLUMN recipient_roles VARCHAR(500) NOT NULL DEFAULT 'owner,manager' AFTER whatsapp;

CREATE TABLE IF NOT EXISTS notification_events (
 id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NULL,
 event VARCHAR(80) NOT NULL,
 entity_type VARCHAR(50) NULL,
 entity_id VARCHAR(80) NULL,
 title VARCHAR(300) NOT NULL,
 body TEXT NOT NULL,
 priority VARCHAR(20) NOT NULL DEFAULT 'normal',
 status VARCHAR(30) NOT NULL DEFAULT 'created',
 channels VARCHAR(200) NOT NULL,
 error_code VARCHAR(100) NULL,
 trace_id VARCHAR(40) NOT NULL,
 created_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 KEY notification_tenant_created(tenant_id,created_at),
 KEY notification_event_created(event,created_at),
 KEY notification_trace(trace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_notifications (
 id VARCHAR(36) NOT NULL,
 notification_id VARCHAR(36) NOT NULL,
 user_id VARCHAR(36) NOT NULL,
 tenant_id VARCHAR(36) NULL,
 read_at BIGINT NULL,
 dismissed_at BIGINT NULL,
 created_at BIGINT NOT NULL,
 PRIMARY KEY(id),
 UNIQUE KEY user_notification_unique(notification_id,user_id),
 KEY user_notifications_user(user_id,read_at,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO platform_notification_settings(event,updated_at) VALUES
 ('order_received',UNIX_TIMESTAMP()*1000),('order_confirmed',UNIX_TIMESTAMP()*1000),
 ('order_ready',UNIX_TIMESTAMP()*1000),('order_cancelled',UNIX_TIMESTAMP()*1000),
 ('booking_received',UNIX_TIMESTAMP()*1000),('booking_confirmed',UNIX_TIMESTAMP()*1000),
 ('booking_cancelled',UNIX_TIMESTAMP()*1000),('waitlist_joined',UNIX_TIMESTAMP()*1000),
 ('waitlist_accepted',UNIX_TIMESTAMP()*1000),('waitlist_expired',UNIX_TIMESTAMP()*1000),
 ('waiter_call',UNIX_TIMESTAMP()*1000),('payment_received',UNIX_TIMESTAMP()*1000),
 ('subscription_activated',UNIX_TIMESTAMP()*1000),('subscription_updated',UNIX_TIMESTAMP()*1000),
 ('technical_error',UNIX_TIMESTAMP()*1000);

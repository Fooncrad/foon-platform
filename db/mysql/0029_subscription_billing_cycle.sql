-- Stores the selected billing interval so annual subscriptions renew for a full year.
ALTER TABLE subscriptions ADD COLUMN billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly';

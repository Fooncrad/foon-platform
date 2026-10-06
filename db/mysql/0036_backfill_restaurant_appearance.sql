-- Backfill appearance settings for existing restaurant tenants.
-- Safe for production: INSERT IGNORE never overwrites an existing tenant configuration.

INSERT IGNORE INTO restaurant_appearance_settings
  (tenant_id,draft_json,published_json,updated_at,published_at)
SELECT
  id,
  '{"template":"grid","theme":{"primary":"#f28c28","background":"#ffffff","corners":"rounded"},"header":"compact","footer":"compact"}',
  '{"template":"grid","theme":{"primary":"#f28c28","background":"#ffffff","corners":"rounded"},"header":"compact","footer":"compact"}',
  UNIX_TIMESTAMP() * 1000,
  UNIX_TIMESTAMP() * 1000
FROM tenants
WHERE activity_id='restaurants';

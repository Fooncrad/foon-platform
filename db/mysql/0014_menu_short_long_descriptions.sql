-- FOON menu descriptions: separate card summary from full item details
-- Safe additive migration. Existing descriptions are copied into both fields.
ALTER TABLE menu_items ADD COLUMN short_description_ar VARCHAR(280) NULL AFTER name_fr;
ALTER TABLE menu_items ADD COLUMN short_description_en VARCHAR(280) NULL AFTER short_description_ar;
ALTER TABLE menu_items ADD COLUMN short_description_fr VARCHAR(280) NULL AFTER short_description_en;
ALTER TABLE menu_items ADD COLUMN long_description_ar TEXT NULL AFTER short_description_fr;
ALTER TABLE menu_items ADD COLUMN long_description_en TEXT NULL AFTER long_description_ar;
ALTER TABLE menu_items ADD COLUMN long_description_fr TEXT NULL AFTER long_description_en;

UPDATE menu_items
SET
 short_description_ar = LEFT(COALESCE(description_ar,''),280),
 short_description_en = LEFT(COALESCE(description_en,''),280),
 short_description_fr = LEFT(COALESCE(description_fr,''),280)
WHERE short_description_ar IS NULL
  AND short_description_en IS NULL
  AND short_description_fr IS NULL;
UPDATE menu_items
SET
 long_description_ar = description_ar,
 long_description_en = description_en,
 long_description_fr = description_fr
WHERE long_description_ar IS NULL
  AND long_description_en IS NULL
  AND long_description_fr IS NULL;

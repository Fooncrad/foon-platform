-- POS service details. Additive/non-destructive.
ALTER TABLE restaurant_orders ADD COLUMN room_number VARCHAR(40) NULL;
ALTER TABLE restaurant_orders ADD COLUMN pickup_label VARCHAR(160) NULL;

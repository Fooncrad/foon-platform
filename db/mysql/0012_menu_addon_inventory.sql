-- Reusable and item-specific add-on stock; zero means untracked inventory.
ALTER TABLE menu_addon_options ADD COLUMN stock_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE menu_addon_library ADD COLUMN stock_quantity INT NOT NULL DEFAULT 0;

-- Add section-aware lookup without removing the legacy branch index, which may be
-- required by TiDB's foreign-key implementation in an existing production schema.
ALTER TABLE restaurant_tables ADD COLUMN section_id VARCHAR(36) NULL AFTER branch_id;
ALTER TABLE restaurant_tables ADD UNIQUE KEY restaurant_tables_section_number(branch_id,section_id,table_number);

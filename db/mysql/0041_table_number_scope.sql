-- Correct table-number uniqueness: numbers are unique inside a section, not across the whole branch.
-- Current operational schema has section_id populated for managed tables.
ALTER TABLE restaurant_tables DROP INDEX restaurant_tables_branch_number;
ALTER TABLE restaurant_tables ADD UNIQUE KEY restaurant_tables_section_number(branch_id,section_id,table_number);

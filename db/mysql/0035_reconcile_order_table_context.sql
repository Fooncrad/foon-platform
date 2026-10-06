-- Production reconciliation for order checkout fields used by the current API.
-- table_id and restaurant_orders_table are already created by 0008_pos_service_context.sql.
-- Keep changes additive; never drop or narrow production data.

ALTER TABLE restaurant_orders
  ADD COLUMN customer_locale VARCHAR(2) NULL AFTER notes;

ALTER TABLE restaurant_order_items
  ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER line_total;

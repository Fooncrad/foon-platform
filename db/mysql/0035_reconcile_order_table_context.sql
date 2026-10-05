-- Production already contains restaurant_orders.table_id and restaurant_orders_table.
-- Keep this migration as a no-op marker so deployments never fail on duplicate
-- column/index errors. Future schema changes must be additive and verified first.
SELECT 1;

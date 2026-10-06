-- Public menu checkout details. Order type and client request ID are added by POS migrations 0007/0008.
ALTER TABLE restaurant_orders ADD COLUMN service_reference VARCHAR(80) NULL;
ALTER TABLE restaurant_orders ADD COLUMN customer_email VARCHAR(254) NULL;
ALTER TABLE restaurant_orders ADD COLUMN notes VARCHAR(1000) NULL;

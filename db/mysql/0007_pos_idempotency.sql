-- POS idempotency for restaurant orders. Additive/non-destructive.
ALTER TABLE restaurant_orders ADD COLUMN client_request_id VARCHAR(80) NULL;
CREATE UNIQUE INDEX restaurant_orders_tenant_client_request ON restaurant_orders(tenant_id,client_request_id);

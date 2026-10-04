-- KDS preparation stations and item routing. Additive only.
CREATE TABLE IF NOT EXISTS restaurant_kds_stations (
 id VARCHAR(36) NOT NULL, tenant_id VARCHAR(36) NOT NULL, branch_id VARCHAR(36) NULL,
 name VARCHAR(120) NOT NULL, station_key VARCHAR(60) NOT NULL, enabled TINYINT(1) NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY kds_station_tenant_key(tenant_id,station_key), KEY kds_station_branch(branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS menu_item_station_routes (
 tenant_id VARCHAR(36) NOT NULL, menu_item_id VARCHAR(36) NOT NULL, station_key VARCHAR(60) NOT NULL DEFAULT 'kitchen',
 PRIMARY KEY(tenant_id,menu_item_id), KEY menu_station_route(tenant_id,station_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
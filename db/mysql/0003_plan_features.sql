CREATE TABLE IF NOT EXISTS package_plan_meta (
 plan_id VARCHAR(40) NOT NULL,
 description_ar TEXT NULL,
 description_en TEXT NULL,
 description_fr TEXT NULL,
 plan_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
 yearly_price DECIMAL(12,2) NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY (plan_id),
 FOREIGN KEY (plan_id) REFERENCES package_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feature_definitions (
 id VARCHAR(80) NOT NULL,
 label_ar VARCHAR(160) NOT NULL,
 label_en VARCHAR(160) NOT NULL,
 label_fr VARCHAR(160) NULL,
 description_ar TEXT NULL,
 description_en TEXT NULL,
 description_fr TEXT NULL,
 created_at BIGINT NOT NULL,
 PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS package_plan_features (
 plan_id VARCHAR(40) NOT NULL,
 feature_id VARCHAR(80) NOT NULL,
 enabled BIGINT NOT NULL DEFAULT 1,
 feature_limit BIGINT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY (plan_id,feature_id),
 FOREIGN KEY (plan_id) REFERENCES package_plans(id),
 FOREIGN KEY (feature_id) REFERENCES feature_definitions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE controller_service_options
ADD COLUMN IF NOT EXISTS final_price INTEGER;

UPDATE controller_service_options cso
SET final_price = cs.base_price + COALESCE(cso.additional_price, 0)
FROM controller_services cs
WHERE cso.controller_service_id = cs.id
  AND cso.final_price IS NULL;

ALTER TABLE controller_service_options
ALTER COLUMN final_price SET DEFAULT 0;

UPDATE controller_service_options
SET final_price = 0
WHERE final_price IS NULL;

ALTER TABLE controller_service_options
ALTER COLUMN final_price SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_controller_service_options_final_price
ON controller_service_options(final_price);

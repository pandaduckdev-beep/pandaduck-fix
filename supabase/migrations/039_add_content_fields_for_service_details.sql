ALTER TABLE controller_services
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS detail_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS expected_results JSONB DEFAULT '[]'::jsonb;

ALTER TABLE controller_service_options
ADD COLUMN IF NOT EXISTS target_audience TEXT;

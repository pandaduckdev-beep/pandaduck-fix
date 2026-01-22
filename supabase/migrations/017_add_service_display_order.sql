-- Add display_order column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set initial display_order based on created_at
UPDATE services
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM services
) AS subquery
WHERE services.id = subquery.id;

-- Make display_order NOT NULL after setting initial values
ALTER TABLE services ALTER COLUMN display_order SET NOT NULL;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);

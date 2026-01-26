-- Add display_order column to controller_service_options table
ALTER TABLE controller_service_options ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display_order based on created_at for existing rows
UPDATE controller_service_options o
SET display_order = subquery.row_num
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM controller_service_options
) subquery
WHERE o.id = subquery.id;

-- Create index for display_order
CREATE INDEX IF NOT EXISTS idx_controller_service_options_display_order
ON controller_service_options(display_order);

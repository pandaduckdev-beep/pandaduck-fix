-- Add icon_name column to controller_services table
ALTER TABLE controller_services
ADD COLUMN IF NOT EXISTS icon_name VARCHAR(50);

-- Add comment to explain the column
COMMENT ON COLUMN controller_services.icon_name IS 'Icon name from lucide-react library (e.g., controller, cpu, wrench)';

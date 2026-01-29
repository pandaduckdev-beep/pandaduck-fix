-- Add detailed_description column to controller_service_options table
-- This field is used for displaying detailed option information in the service detail modal

ALTER TABLE controller_service_options
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Add comment to document the column
COMMENT ON COLUMN controller_service_options.detailed_description IS 'Detailed description for service detail modal (optional, falls back to option_description)';

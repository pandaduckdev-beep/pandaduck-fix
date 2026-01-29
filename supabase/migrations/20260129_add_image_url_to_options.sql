-- Add image_url column to controller_service_options table
-- This allows each option to have its own image for display in the service detail modal

ALTER TABLE controller_service_options
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN controller_service_options.image_url IS 'URL to option image stored in Supabase Storage (service-images bucket)';

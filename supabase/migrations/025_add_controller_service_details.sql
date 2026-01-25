-- Add detail fields to controller_services table
ALTER TABLE controller_services
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '1일',
ADD COLUMN IF NOT EXISTS warranty TEXT DEFAULT '1년',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for image_url for better performance
CREATE INDEX IF NOT EXISTS idx_controller_services_image_url ON controller_services(image_url) WHERE image_url IS NOT NULL;

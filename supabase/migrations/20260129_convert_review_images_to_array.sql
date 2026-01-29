-- Convert review image_url from text to text array for multiple images
-- First, rename the old column
ALTER TABLE reviews RENAME COLUMN image_url TO image_url_old;

-- Add new column as text array
ALTER TABLE reviews ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Migrate existing data (convert single image_url to array)
UPDATE reviews
SET image_urls = CASE
  WHEN image_url_old IS NOT NULL AND image_url_old != ''
  THEN ARRAY[image_url_old]
  ELSE '{}'
END;

-- Drop the old column
ALTER TABLE reviews DROP COLUMN image_url_old;

-- Add comment
COMMENT ON COLUMN reviews.image_urls IS 'Array of image URLs (max 3 images)';

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "service_images_public_access" ON storage.objects;
DROP POLICY IF EXISTS "service_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "service_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "service_images_authenticated_delete" ON storage.objects;

-- Set up storage policies for service images
CREATE POLICY "service_images_public_access"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "service_images_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'service-images');

CREATE POLICY "service_images_authenticated_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'service-images');

CREATE POLICY "service_images_authenticated_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'service-images');

INSERT INTO storage.buckets (id, name, public)
VALUES ('repair-log-images', 'repair-log-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "repair_log_images_public_access" ON storage.objects;
DROP POLICY IF EXISTS "repair_log_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "repair_log_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "repair_log_images_authenticated_delete" ON storage.objects;

CREATE POLICY "repair_log_images_public_access"
ON storage.objects FOR SELECT
USING (bucket_id = 'repair-log-images');

CREATE POLICY "repair_log_images_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'repair-log-images');

CREATE POLICY "repair_log_images_authenticated_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'repair-log-images');

CREATE POLICY "repair_log_images_authenticated_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'repair-log-images');

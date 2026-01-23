-- 리뷰 이미지를 위한 Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- 리뷰 이미지 업로드를 위한 Storage 정책
CREATE POLICY "Anyone can upload review images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'reviews');

CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reviews');

CREATE POLICY "Admins can delete review images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reviews');

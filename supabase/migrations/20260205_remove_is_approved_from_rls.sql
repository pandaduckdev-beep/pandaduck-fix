-- Migration: 리뷰 RLS 정책에서 is_approved 조건 제거
-- 리뷰 승인 절차가 폐지됨에 따라, 공개 리뷰 조회 시 is_approved 조건을 제거합니다.
-- is_public = true인 리뷰만 공개됩니다.

-- 1. 기존 공개 리뷰 조회 정책 삭제
DROP POLICY IF EXISTS "Anyone can read approved public reviews" ON reviews;

-- 2. 새로운 공개 리뷰 조회 정책 생성 (is_public만 체크)
CREATE POLICY "Anyone can read public reviews"
ON reviews FOR SELECT
USING (is_public = true);

-- 3. 코멘트 업데이트
COMMENT ON POLICY "Anyone can read public reviews" ON reviews IS 'Public read access to public reviews (approval process removed)';

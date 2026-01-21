-- repair_requests 테이블의 RLS 정책 수정
-- 기존 정책 삭제 후 올바른 정책 재생성

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can create repair requests" ON repair_requests;

-- 새로운 정책: 모든 필드에 대해 INSERT 허용
CREATE POLICY "Enable insert for all users"
  ON repair_requests
  FOR INSERT
  WITH CHECK (true);

-- 필요한 경우 사용자가 자신의 신청 내역을 조회할 수 있도록 SELECT 정책 추가
-- (선택적, 향후 추가 가능)
-- CREATE POLICY "Users can view own requests"
--   ON repair_requests
--   FOR SELECT
--   USING (customer_phone = current_setting('request.jwt.claims', true)::json->>'phone');

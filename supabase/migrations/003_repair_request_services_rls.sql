-- repair_request_services 테이블에 RLS 정책 추가
-- 수리 신청 시 서비스 상세 정보를 삽입할 수 있도록 허용

ALTER TABLE repair_request_services ENABLE ROW LEVEL SECURITY;

-- 누구나 수리 신청 서비스를 생성할 수 있음 (repair_requests와 함께 생성됨)
CREATE POLICY "Anyone can create repair request services"
  ON repair_request_services
  FOR INSERT
  WITH CHECK (true);

-- 관리자만 조회 가능 (일반 사용자는 조회 불가)
-- 향후 필요시 사용자가 자신의 신청 내역을 볼 수 있도록 정책 추가 가능

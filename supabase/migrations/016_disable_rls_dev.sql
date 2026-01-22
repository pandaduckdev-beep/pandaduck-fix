-- 개발 환경용 RLS 비활성화 (임시)
-- RLS 정책 문제 해결을 위해 일시적으로 RLS를 비활성화합니다.
-- 프로덕션 환경에서는 RLS를 활성화하여 보안을 유지하세요.

-- 1. services 테이블 RLS 비활성화
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- 2. service_options 테이블 RLS 비활성화
ALTER TABLE service_options DISABLE ROW LEVEL SECURITY;

-- 3. admin_users 테이블 RLS 비활성화
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 4. controller_models 테이블 RLS 비활성화
ALTER TABLE controller_models DISABLE ROW LEVEL SECURITY;

-- 5. controller_service_pricing 테이블 RLS 비활성화
ALTER TABLE controller_service_pricing DISABLE ROW LEVEL SECURITY;

-- 6. controller_option_pricing 테이블 RLS 비활성화
ALTER TABLE controller_option_pricing DISABLE ROW LEVEL SECURITY;

-- 7. repair_requests 테이블 RLS 비활성화
ALTER TABLE repair_requests DISABLE ROW LEVEL SECURITY;

-- 8. repair_request_services 테이블 RLS 비활성화
ALTER TABLE repair_request_services DISABLE ROW LEVEL SECURITY;

-- 9. reviews 테이블 RLS 비활성화
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 10. status_history 테이블 RLS 비활성화
ALTER TABLE status_history DISABLE ROW LEVEL SECURITY;

-- 11. service_combos 테이블 RLS 비활성화
ALTER TABLE service_combos DISABLE ROW LEVEL SECURITY;

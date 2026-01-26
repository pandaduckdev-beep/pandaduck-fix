-- 미사용 레거시 테이블 제거
-- controller_service_pricing과 controller_option_pricing 테이블은
-- 컨트롤러별 독립 서비스 관리 체계로 전환되면서 더 이상 사용되지 않음
-- 현재는 controller_services.base_price와 controller_service_options.additional_price를 직접 사용

-- 1. controller_option_pricing 테이블 삭제
DROP TABLE IF EXISTS controller_option_pricing CASCADE;

-- 2. controller_service_pricing 테이블 삭제
DROP TABLE IF EXISTS controller_service_pricing CASCADE;

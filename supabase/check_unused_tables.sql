-- 현재 데이터베이스에서 사용되지 않는 테이블 확인
-- 참조 관계를 체크하여 안전하게 삭제 가능한지 확인

-- 1. controller_service_pricing 사용 여부
-- ServicesPage에서는 controller_services 테이블 사용 (base_price 직접 저장)
SELECT COUNT(*) as count FROM controller_service_pricing;

-- 2. controller_option_pricing 사용 여부
-- ServicesPage에서는 controller_service_options 테이블 사용 (additional_price 직접 저장)
SELECT COUNT(*) as count FROM controller_option_pricing;

-- 3. services 테이블 사용 여부 (repair_requests에서 참조하는지 확인)
SELECT COUNT(*) as count FROM repair_request_services WHERE service_id IS NOT NULL;

-- 4. service_options 테이블 사용 여부 (repair_request_services에서 참조하는지 확인)
SELECT COUNT(*) as count FROM repair_request_services WHERE selected_option_id IS NOT NULL;

-- 참고: controller_services 테이블의 데이터 확인
SELECT COUNT(*) as count FROM controller_services;

-- 참고: controller_service_options 테이블의 데이터 확인
SELECT COUNT(*) as count FROM controller_service_options;

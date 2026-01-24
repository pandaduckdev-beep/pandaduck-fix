-- 불필요한 테이블과 관련된 외래 키 제거 전 확인

-- 1. repair_request_services가 services를 참조하는지 확인
SELECT
    column_name,
    foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'repair_request_services'
    AND kcu.foreign_table_name = 'services';

-- 2. repair_request_services가 service_options를 참조하는지 확인
SELECT
    column_name,
    foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'repair_request_services'
    AND kcu.foreign_table_name = 'service_options';

-- 3. repair_requests가 services나 service_options를 참조하는지 확인
SELECT
    column_name,
    foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'repair_requests'
    AND kcu.foreign_table_name IN ('services', 'service_options');

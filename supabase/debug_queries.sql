-- 1. controller_models 데이터 확인
SELECT id, model_id, model_name, is_active
FROM controller_models
ORDER BY display_order;

-- 2. controller_services 테이블 확인 (데이터가 있는지)
SELECT COUNT(*) as service_count FROM controller_services;

-- 3. controller_services 상세 데이터 확인
SELECT cs.id, cs.name, cs.service_id, cs.base_price, cm.model_name, cm.id as controller_model_id
FROM controller_services cs
JOIN controller_models cm ON cs.controller_model_id = cm.id
ORDER BY cm.display_order, cs.display_order;

-- 4. RLS 정책 확인
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('controller_services', 'controller_service_options', 'admin_users');

-- 1. controller_models와 controller_services 연결 확인
SELECT
    cm.id as controller_model_id,
    cm.model_id,
    cm.model_name,
    COUNT(cs.id) as service_count
FROM controller_models cm
LEFT JOIN controller_services cs ON cm.id = cs.controller_model_id
GROUP BY cm.id, cm.model_id, cm.model_name
ORDER BY cm.display_order;

-- 2. controller_services 샘플 데이터 확인
SELECT
    cs.id,
    cs.name,
    cs.service_id,
    cs.base_price,
    cs.is_active,
    cs.display_order,
    cm.model_name,
    cm.model_id
FROM controller_services cs
JOIN controller_models cm ON cs.controller_model_id = cm.id
LIMIT 10;

-- 3. 모든 컨트롤러 모델에 대한 UUID 확인
SELECT id, model_id, model_name, is_active, display_order
FROM controller_models
ORDER BY display_order;

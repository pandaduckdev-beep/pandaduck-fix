-- 기존 services 데이터를 controller_services로 이전
-- 모든 컨트롤러 모델에 대해서 서비스 생성

INSERT INTO controller_services (controller_model_id, service_id, name, description, base_price, is_active, display_order)
SELECT
    cm.id,
    s.id,
    s.name,
    s.description,
    s.base_price,
    s.is_active,
    s.display_order
FROM services s
CROSS JOIN controller_models cm
WHERE s.is_active = true;

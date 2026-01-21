-- 컨트롤러 모델별 서비스 가격 차등 적용을 위한 스키마 수정

-- 1. 컨트롤러 모델 테이블 생성
CREATE TABLE IF NOT EXISTS controller_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT UNIQUE NOT NULL, -- 'dualsense', 'dualsense-edge', 'dualshock4', 'joycon'
  model_name TEXT NOT NULL, -- 'DualSense', 'DualSense Edge', etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 컨트롤러 모델별 서비스 가격 테이블 생성
CREATE TABLE IF NOT EXISTS controller_service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  controller_model_id UUID REFERENCES controller_models(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  price INTEGER NOT NULL, -- 해당 모델에 대한 서비스 가격
  is_available BOOLEAN DEFAULT true, -- 해당 모델에서 이 서비스 제공 여부
  notes TEXT, -- 모델별 특이사항
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(controller_model_id, service_id)
);

-- 3. 컨트롤러 모델별 옵션 가격 테이블 생성
CREATE TABLE IF NOT EXISTS controller_option_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  controller_model_id UUID REFERENCES controller_models(id) ON DELETE CASCADE,
  service_option_id UUID REFERENCES service_options(id) ON DELETE CASCADE,
  additional_price INTEGER NOT NULL, -- 해당 모델에 대한 옵션 추가 가격
  is_available BOOLEAN DEFAULT true, -- 해당 모델에서 이 옵션 제공 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(controller_model_id, service_option_id)
);

-- 4. 기본 컨트롤러 모델 데이터 삽입 (중복 방지)
INSERT INTO controller_models (model_id, model_name, description, display_order) VALUES
  ('dualsense', 'DualSense', 'PlayStation 5 기본 컨트롤러', 1),
  ('dualsense-edge', 'DualSense Edge', 'PlayStation 5 프로 컨트롤러', 2),
  ('dualshock4', 'DualShock 4', 'PlayStation 4 컨트롤러', 3),
  ('joycon', 'Nintendo Joy-Con', 'Nintendo Switch 컨트롤러', 4)
ON CONFLICT (model_id) DO NOTHING;

-- 5. DualSense 기본 가격 설정 (기존 services 테이블의 base_price 사용)
INSERT INTO controller_service_pricing (controller_model_id, service_id, price, is_available)
SELECT
  cm.id,
  s.id,
  s.base_price,
  true
FROM controller_models cm
CROSS JOIN services s
WHERE cm.model_id = 'dualsense' AND s.is_active = true
ON CONFLICT (controller_model_id, service_id) DO UPDATE
SET price = EXCLUDED.price, is_available = EXCLUDED.is_available;

-- 6. DualSense Edge 가격 설정 (10% 할증)
INSERT INTO controller_service_pricing (controller_model_id, service_id, price, is_available)
SELECT
  cm.id,
  s.id,
  ROUND(s.base_price * 1.1)::INTEGER, -- 10% 할증
  true
FROM controller_models cm
CROSS JOIN services s
WHERE cm.model_id = 'dualsense-edge' AND s.is_active = true
ON CONFLICT (controller_model_id, service_id) DO UPDATE
SET price = EXCLUDED.price, is_available = EXCLUDED.is_available;

-- 7. DualShock 4 가격 설정 (기본 가격과 동일)
INSERT INTO controller_service_pricing (controller_model_id, service_id, price, is_available)
SELECT
  cm.id,
  s.id,
  s.base_price,
  true
FROM controller_models cm
CROSS JOIN services s
WHERE cm.model_id = 'dualshock4' AND s.is_active = true
ON CONFLICT (controller_model_id, service_id) DO UPDATE
SET price = EXCLUDED.price, is_available = EXCLUDED.is_available;

-- 8. Joy-Con 가격 설정 (백 버튼은 제공 안 함, 나머지는 20% 할증)
INSERT INTO controller_service_pricing (controller_model_id, service_id, price, is_available)
SELECT
  cm.id,
  s.id,
  ROUND(s.base_price * 1.2)::INTEGER, -- 20% 할증
  CASE WHEN s.service_id = 'back-buttons' THEN false ELSE true END -- 백 버튼 불가
FROM controller_models cm
CROSS JOIN services s
WHERE cm.model_id = 'joycon' AND s.is_active = true
ON CONFLICT (controller_model_id, service_id) DO UPDATE
SET price = EXCLUDED.price, is_available = EXCLUDED.is_available;

-- 9. 옵션 가격도 동일한 방식으로 설정
-- DualSense 옵션 (기본)
INSERT INTO controller_option_pricing (controller_model_id, service_option_id, additional_price, is_available)
SELECT
  cm.id,
  so.id,
  so.additional_price,
  true
FROM controller_models cm
CROSS JOIN service_options so
WHERE cm.model_id = 'dualsense' AND so.is_active = true
ON CONFLICT (controller_model_id, service_option_id) DO UPDATE
SET additional_price = EXCLUDED.additional_price, is_available = EXCLUDED.is_available;

-- DualSense Edge 옵션 (10% 할증)
INSERT INTO controller_option_pricing (controller_model_id, service_option_id, additional_price, is_available)
SELECT
  cm.id,
  so.id,
  ROUND(so.additional_price * 1.1)::INTEGER,
  true
FROM controller_models cm
CROSS JOIN service_options so
WHERE cm.model_id = 'dualsense-edge' AND so.is_active = true
ON CONFLICT (controller_model_id, service_option_id) DO UPDATE
SET additional_price = EXCLUDED.additional_price, is_available = EXCLUDED.is_available;

-- DualShock 4 옵션 (기본)
INSERT INTO controller_option_pricing (controller_model_id, service_option_id, additional_price, is_available)
SELECT
  cm.id,
  so.id,
  so.additional_price,
  true
FROM controller_models cm
CROSS JOIN service_options so
WHERE cm.model_id = 'dualshock4' AND so.is_active = true
ON CONFLICT (controller_model_id, service_option_id) DO UPDATE
SET additional_price = EXCLUDED.additional_price, is_available = EXCLUDED.is_available;

-- Joy-Con 옵션 (20% 할증)
INSERT INTO controller_option_pricing (controller_model_id, service_option_id, additional_price, is_available)
SELECT
  cm.id,
  so.id,
  ROUND(so.additional_price * 1.2)::INTEGER,
  true
FROM controller_models cm
CROSS JOIN service_options so
WHERE cm.model_id = 'joycon' AND so.is_active = true
ON CONFLICT (controller_model_id, service_option_id) DO UPDATE
SET additional_price = EXCLUDED.additional_price, is_available = EXCLUDED.is_available;

-- 10. 인덱스 생성
CREATE INDEX idx_controller_service_pricing_model ON controller_service_pricing(controller_model_id);
CREATE INDEX idx_controller_service_pricing_service ON controller_service_pricing(service_id);
CREATE INDEX idx_controller_option_pricing_model ON controller_option_pricing(controller_model_id);
CREATE INDEX idx_controller_option_pricing_option ON controller_option_pricing(service_option_id);

-- 11. updated_at 트리거 추가
CREATE TRIGGER trigger_update_controller_models_updated_at
  BEFORE UPDATE ON controller_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_controller_service_pricing_updated_at
  BEFORE UPDATE ON controller_service_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_controller_option_pricing_updated_at
  BEFORE UPDATE ON controller_option_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. RLS 정책 추가
ALTER TABLE controller_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Controller models are viewable by everyone"
  ON controller_models FOR SELECT
  USING (is_active = true);

ALTER TABLE controller_service_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Controller service pricing is viewable by everyone"
  ON controller_service_pricing FOR SELECT
  USING (is_available = true);

ALTER TABLE controller_option_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Controller option pricing is viewable by everyone"
  ON controller_option_pricing FOR SELECT
  USING (is_available = true);

-- 13. 주석
COMMENT ON TABLE controller_models IS '컨트롤러 모델 정보 (DualSense, Joy-Con 등)';
COMMENT ON TABLE controller_service_pricing IS '컨트롤러 모델별 서비스 가격 차등';
COMMENT ON TABLE controller_option_pricing IS '컨트롤러 모델별 옵션 가격 차등';

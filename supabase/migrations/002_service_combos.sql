-- Service Combos/Discounts Table
-- Stores discount rules for combinations of services

CREATE TABLE IF NOT EXISTS service_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  required_service_ids TEXT[] NOT NULL, -- Array of service_ids that must be selected together
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some example combo discounts
INSERT INTO service_combos (combo_name, description, discount_type, discount_value, required_service_ids) VALUES
  ('홀 이펙트 + 클릭 버튼 패키지', '홀 이펙트와 클릭 버튼을 함께 신청하면 5,000원 할인', 'fixed', 5000, ARRAY['hall-effect', 'clicky-buttons']),
  ('백 버튼 + 헤어 트리거 콤보', '백 버튼과 헤어 트리거를 함께 신청하면 3,000원 할인', 'fixed', 3000, ARRAY['back-buttons', 'hair-trigger']),
  ('3개 이상 서비스 할인', '3개 이상의 서비스를 선택하면 10% 할인', 'percentage', 10, ARRAY['hall-effect', 'clicky-buttons', 'back-buttons']),
  ('프리미엄 패키지', '홀 이펙트, 클릭 버튼, 백 버튼을 함께 신청하면 10,000원 할인', 'fixed', 10000, ARRAY['hall-effect', 'clicky-buttons', 'back-buttons']);

-- Create index for faster lookups
CREATE INDEX idx_service_combos_active ON service_combos(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_service_combos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_combos_updated_at
  BEFORE UPDATE ON service_combos
  FOR EACH ROW
  EXECUTE FUNCTION update_service_combos_updated_at();

-- Add RLS policies
ALTER TABLE service_combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service combos are viewable by everyone"
  ON service_combos FOR SELECT
  USING (is_active = true);

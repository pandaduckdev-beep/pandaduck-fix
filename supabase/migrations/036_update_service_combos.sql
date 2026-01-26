-- Update service_combos table to work with new controller_services structure
-- This migration updates the combo system to be controller-specific

-- Drop old service_combos table if it exists
DROP TABLE IF EXISTS service_combos CASCADE;

-- Create new service_combos table
CREATE TABLE service_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Combo information
  combo_name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Discount configuration
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,

  -- Controller and service requirements
  controller_model_id UUID REFERENCES controller_models(id) ON DELETE CASCADE,
  required_service_ids TEXT[] NOT NULL, -- Array of service_ids (not UUIDs, but service identifiers like 'hall-effect')
  min_service_count INTEGER DEFAULT 0, -- Minimum number of services required (for "3개 이상" type combos)

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Priority (higher number = higher priority when multiple combos apply)
  priority INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_service_combos_active ON service_combos(is_active);
CREATE INDEX idx_service_combos_controller ON service_combos(controller_model_id);

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

CREATE POLICY "Service combos are manageable by authenticated users"
  ON service_combos FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert example combos (these will need to be configured via admin panel)
-- Note: You'll need to replace these with actual controller_model_id UUIDs from your database
INSERT INTO service_combos (combo_name, description, discount_type, discount_value, required_service_ids, min_service_count, priority)
VALUES
  ('3개 이상 서비스 할인', '3개 이상의 서비스를 선택하면 10% 할인', 'percentage', 10, ARRAY[]::TEXT[], 3, 1);

-- Add comment
COMMENT ON TABLE service_combos IS '서비스 조합 할인 설정 테이블';
COMMENT ON COLUMN service_combos.required_service_ids IS '필수 서비스 ID 배열 (service_id 문자열, 예: hall-effect, clicky-buttons)';
COMMENT ON COLUMN service_combos.min_service_count IS '최소 서비스 개수 (0이면 required_service_ids 기반, 1 이상이면 개수 기반)';
COMMENT ON COLUMN service_combos.priority IS '우선순위 (높을수록 먼저 적용)';

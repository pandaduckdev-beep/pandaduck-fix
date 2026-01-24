-- 서비스 테이블에 컨트롤러 모델 ID 추가
-- 각 서비스가 어떤 컨트롤러 모델에 속하는지 식별

-- 1. controller_model_id 컬럼 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS controller_model_id UUID REFERENCES controller_models(id) ON DELETE CASCADE;

-- 2. 인덱스 생성 (쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_services_controller_model ON services(controller_model_id);

-- 3. 기존 데이터에 대한 controller_model_id 설정 (기본값: 듀얼센스)
UPDATE services SET controller_model_id = (
  SELECT id FROM controller_models WHERE model_id = 'dualsense' LIMIT 1
) WHERE controller_model_id IS NULL;

-- 4. 제약조건 수정 (기존 제약조건 삭제 후 새 제약조건 추가)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'services_service_id_key'
  ) THEN
    ALTER TABLE services DROP CONSTRAINT services_service_id_key;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'services_controller_model_service_id_key'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_controller_model_service_id_key UNIQUE (controller_model_id, service_id);
  END IF;
END $$;

-- 5. 주석 추가
COMMENT ON COLUMN services.controller_model_id IS '연결된 컨트롤러 모델 ID (컨트롤러별로 서비스를 분리하여 관리하기 위함)';

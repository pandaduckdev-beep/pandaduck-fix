-- ============================================
-- Controller Models 더미 데이터 SQL 쿼리
-- ============================================
--
-- 사용 방법:
-- 이 쿼리를 Supabase SQL Editor에서 실행하세요.
--
-- 참고: controller_models 테이블이 이미 존재해야 합니다.
-- schema.sql에 정의되어 있습니다.

-- ============================================
-- 기존 데이터 확인 (선택사항)
-- ============================================
-- SELECT * FROM controller_models ORDER BY display_order;

-- ============================================
-- Controller Models 더미 데이터 삽입
-- ============================================

-- 기존 데이터 삭제 (선택사항 - 중복 방지)
-- DELETE FROM controller_models;

-- Controller Models 데이터
INSERT INTO controller_models (
  model_id,
  model_name,
  description,
  is_active,
  display_order
) VALUES
(
  'dualsense',
  'DualSense',
  'PlayStation 5 기본 컨트롤러',
  true,
  1
),
(
  'dualsense-edge',
  'DualSense Edge',
  'PlayStation 5 프로 컨트롤러',
  true,
  2
),
(
  'dualshock4',
  'DualShock 4',
  'PlayStation 4 컨트롤러',
  true,
  3
),
(
  'joycon',
  'Nintendo Joy-Con',
  'Nintendo Switch 컨트롤러',
  true,
  4
),
(
  'xbox-elite',
  'Xbox Elite Series 2',
  'Xbox 프로 컨트롤러',
  true,
  5
)
ON CONFLICT (model_id) DO NOTHING;

-- ============================================
-- 결과 확인
-- ============================================
-- 생성된 컨트롤러 모델 확인
-- SELECT
--   model_id,
--   model_name,
--   description,
--   is_active,
--   display_order
-- FROM controller_models
-- WHERE is_active = true
-- ORDER BY display_order;

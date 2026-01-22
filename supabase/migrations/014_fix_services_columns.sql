-- services 테이블 컬럼 정리 (불필요한 컬럼 제거)
-- icon 컬럼 제거 (실제 스키마에는 없음)

-- 이미 존재하지 않는 컬럼이면 에러 발생하므로,
-- Supabase Dashboard에서 수동으로 확인 후 필요시만 실행

-- 현재 schema.sql에 있는 services 컬럼:
-- id, service_id, name, description, base_price, duration, warranty, features, process, image_url, is_active, display_order, created_at, updated_at

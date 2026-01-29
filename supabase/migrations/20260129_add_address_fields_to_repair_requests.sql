-- Add structured address fields to repair_requests table
-- This allows for better address management and querying

ALTER TABLE repair_requests
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS detail_address TEXT;

-- Add comments to explain the fields
COMMENT ON COLUMN repair_requests.postal_code IS '우편번호 (5자리)';
COMMENT ON COLUMN repair_requests.address IS '기본 주소 (도로명 또는 지번)';
COMMENT ON COLUMN repair_requests.detail_address IS '상세 주소 (동/호수 등)';

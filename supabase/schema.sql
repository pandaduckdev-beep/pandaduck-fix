-- ============================================
-- PandaDuck Fix Database Schema
-- ============================================

-- 1. 수리 의뢰 테이블 (repair_requests)
-- 고객의 수리 신청 정보
CREATE TABLE repair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 고객 정보
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- 수리 정보
  controller_model TEXT NOT NULL, -- 'DualSense', 'DualSense Edge' 등
  issue_description TEXT, -- 문제 설명

  -- 상태 관리
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'

  -- 총 금액
  total_amount INTEGER NOT NULL,

  -- 예상 완료일
  estimated_completion_date DATE,
  actual_completion_date DATE,

  -- 메모
  admin_notes TEXT, -- 관리자 메모

  -- 리뷰 관련
  review_token TEXT UNIQUE, -- 리뷰 작성용 토큰
  review_sent_at TIMESTAMPTZ, -- 리뷰 요청 발송 시각

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 수리 의뢰 서비스 상세 테이블 (repair_request_services)
-- 각 의뢰에 포함된 서비스들
CREATE TABLE repair_request_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  service_id UUID,
  selected_option_id UUID,

  -- 주문 시점의 가격 (나중에 가격이 변경되어도 주문 당시 가격 유지)
  service_price INTEGER NOT NULL,
  option_price INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 리뷰 테이블 (reviews)
-- 고객 리뷰 관리
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE SET NULL,

  -- 리뷰 내용
  customer_name TEXT NOT NULL, -- 표시용 이름 (일부 마스킹 가능)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  service_name TEXT NOT NULL, -- 리뷰 시점의 서비스명

  -- 이미지
  image_url TEXT,

  -- 승인 관리
  is_approved BOOLEAN DEFAULT false, -- 관리자 승인 여부
  is_public BOOLEAN DEFAULT false, -- 공개 여부

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 상태 변경 이력 테이블 (status_history)
-- 수리 의뢰 상태 변경 추적
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT, -- 변경한 관리자 이름/ID
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 인덱스 생성
-- ============================================

CREATE INDEX idx_repair_requests_status ON repair_requests(status);
CREATE INDEX idx_repair_requests_phone ON repair_requests(customer_phone);
CREATE INDEX idx_repair_requests_token ON repair_requests(review_token);
CREATE INDEX idx_repair_request_services_request ON repair_request_services(repair_request_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved, is_public);
CREATE INDEX idx_reviews_request ON reviews(repair_request_id);
CREATE INDEX idx_status_history_request ON status_history(repair_request_id);

-- ============================================
-- Updated_at 자동 업데이트 트리거
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_repair_requests_updated_at
  BEFORE UPDATE ON repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================

-- repair_requests 테이블: 생성만 가능 (조회/수정은 관리자만)
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create repair requests" ON repair_requests
  FOR INSERT WITH CHECK (true);

-- reviews 테이블: 승인된 리뷰만 공개
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_approved = true AND is_public = true);

-- ============================================
-- 편의 함수들
-- ============================================

-- 리뷰 토큰 생성 함수
CREATE OR REPLACE FUNCTION generate_review_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 수리 의뢰 상태 변경 함수 (상태 이력 자동 기록)
CREATE OR REPLACE FUNCTION change_repair_request_status(
  request_id UUID,
  new_status TEXT,
  changed_by_name TEXT DEFAULT NULL,
  change_notes TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  old_status TEXT;
BEGIN
  -- 현재 상태 가져오기
  SELECT status INTO old_status FROM repair_requests WHERE id = request_id;

  -- 상태 업데이트
  UPDATE repair_requests
  SET status = new_status,
      updated_at = now()
  WHERE id = request_id;

  -- 이력 기록
  INSERT INTO status_history (repair_request_id, previous_status, new_status, changed_by, notes)
  VALUES (request_id, old_status, new_status, changed_by_name, change_notes);
END;
$$ LANGUAGE plpgsql;

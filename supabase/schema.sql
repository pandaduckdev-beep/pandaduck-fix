-- ============================================
-- PandaDuck Fix Database Schema
-- ============================================

-- 1. 서비스 테이블 (services)
-- 제공하는 수리/커스터마이징 서비스 관리
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT UNIQUE NOT NULL, -- 'hall-effect', 'clicky-buttons' 등
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price INTEGER NOT NULL, -- 기본 가격 (원 단위)
  duration TEXT NOT NULL, -- '1일', '2일' 등
  warranty TEXT NOT NULL, -- '평생', '1년', '6개월' 등
  features JSONB NOT NULL, -- 주요 특징 배열
  process JSONB NOT NULL, -- 작업 과정 배열
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 서비스 옵션 테이블 (service_options)
-- 각 서비스의 선택 가능한 옵션들
CREATE TABLE service_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  option_description TEXT NOT NULL,
  additional_price INTEGER NOT NULL DEFAULT 0, -- 추가 가격
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 수리 의뢰 테이블 (repair_requests)
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
  service_id UUID REFERENCES services(id),
  selected_option_id UUID REFERENCES service_options(id),

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

CREATE INDEX idx_services_service_id ON services(service_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_service_options_service ON service_options(service_id);
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

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- services 테이블: 모두 읽기 가능
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

-- service_options 테이블: 모두 읽기 가능
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service options are viewable by everyone" ON service_options
  FOR SELECT USING (true);

-- repair_requests 테이블: 생성만 가능 (조회/수정은 관리자만)
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create repair requests" ON repair_requests
  FOR INSERT WITH CHECK (true);

-- reviews 테이블: 승인된 리뷰만 공개
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_approved = true AND is_public = true);

-- ============================================
-- 초기 데이터 삽입
-- ============================================

-- 서비스 데이터
INSERT INTO services (service_id, name, description, base_price, duration, warranty, features, process, image_url, display_order) VALUES
('hall-effect', '홀 이펙트 센서 업그레이드', '자석 기반 센서로 스틱 드리프트를 영구적으로 해결합니다.', 25000, '1일', '평생',
  '["영구 보증", "무드리프트 보장", "1일 작업"]'::jsonb,
  '["컨트롤러 정밀 분해 및 상태 점검", "기존 아날로그 스틱 모듈 제거", "홀 이펙트 센서 모듈 장착 및 캘리브레이션", "품질 테스트 및 최종 점검", "조립 완료 및 동작 확인"]'::jsonb,
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwY29udHJvbGxlciUyMHN0aWNrfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  1),
('clicky-buttons', '클릭키 버튼 모듈', 'eXtremeRate 프리미엄 촉감 스위치로 버튼 반응성을 극대화합니다.', 25000, '1일', '1년',
  '["프리미엄 스위치", "내구성 향상", "클릭감 개선"]'::jsonb,
  '["컨트롤러 분해 및 버튼 모듈 접근", "기존 러버돔 방식 버튼 제거", "eXtremeRate 클릭키 모듈 정밀 장착", "버튼 반응성 테스트 및 조정", "최종 조립 및 품질 확인"]'::jsonb,
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBidXR0b25zfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  2),
('back-buttons', '백버튼 모드', '프로게이머급 후면 패들을 추가하여 경쟁력을 높입니다.', 40000, '2일', '1년',
  '["2~4개 패들", "커스텀 매핑", "프로급 성능"]'::jsonb,
  '["컨트롤러 완전 분해", "백버튼 모듈 장착을 위한 쉘 가공", "회로 연결 및 패들 버튼 장착", "버튼 매핑 프로그래밍", "작동 테스트 및 최종 조립"]'::jsonb,
  'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm8lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  3),
('battery', '고용량 배터리', '고용량 배터리로 최대 3배 더 긴 플레이타임을 제공합니다.', 15000, '1일', '6개월',
  '["고용량", "3배 수명", "안전 인증"]'::jsonb,
  '["컨트롤러 분해 및 기존 배터리 제거", "새 고용량 배터리 연결", "충전 회로 점검 및 테스트", "배터리 셀 밸런싱", "조립 완료 및 충전 테스트"]'::jsonb,
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJ5JTIwY2hhcmdpbmd8ZW58MXx8fHwxNzY4OTI3MTk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  4),
('hair-trigger', '헤어 트리거', '트리거 반응거리를 단축하여 FPS 게임에서 우위를 점합니다.', 25000, '1일', '1년',
  '["즉각 반응", "조절 가능", "FPS 최적화"]'::jsonb,
  '["컨트롤러 분해 및 트리거 모듈 접근", "헤어 트리거 스톱퍼 장착", "트리거 깊이 조절 및 테스트", "스위치 장착 (on/off 전환용)", "최종 조립 및 동작 확인"]'::jsonb,
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzaG9vdGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  5),
('custom-shell', '커스텀 쉘 교체', '다양한 색상과 디자인의 프리미엄 쉘로 개성을 표현하세요.', 30000, '1일', '6개월',
  '["다양한 색상", "프리미엄 재질", "독특한 디자인"]'::jsonb,
  '["컨트롤러 완전 분해", "기존 쉘 제거 및 부품 이동", "새 커스텀 쉘에 부품 장착", "정밀 조립 및 핏 확인", "최종 검수 및 마감 처리"]'::jsonb,
  'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  6);

-- 서비스 옵션 데이터
DO $$
DECLARE
  hall_effect_id UUID;
  clicky_buttons_id UUID;
  back_buttons_id UUID;
BEGIN
  -- 홀 이펙트 옵션
  SELECT id INTO hall_effect_id FROM services WHERE service_id = 'hall-effect';
  INSERT INTO service_options (service_id, option_name, option_description, additional_price, display_order) VALUES
    (hall_effect_id, '기본형', '홀 이펙트 센서', 0, 1),
    (hall_effect_id, '굴리킷 TMR', 'Gulikit TMR 센서', 15000, 2),
    (hall_effect_id, '굴리킷 TMR 720', '텐션 조절이 가능한 TMR 센서', 25000, 3);

  -- 클릭키 버튼 옵션
  SELECT id INTO clicky_buttons_id FROM services WHERE service_id = 'clicky-buttons';
  INSERT INTO service_options (service_id, option_name, option_description, additional_price, display_order) VALUES
    (clicky_buttons_id, 'LIGHT', 'eXtremeRate 스탠다드', 0, 1),
    (clicky_buttons_id, 'STRONG', 'eXtremeRate 스탠다드', 0, 2);

  -- 백버튼 옵션
  SELECT id INTO back_buttons_id FROM services WHERE service_id = 'back-buttons';
  INSERT INTO service_options (service_id, option_name, option_description, additional_price, display_order) VALUES
    (back_buttons_id, 'RISE3', 'eXtremeRate 2버튼', 0, 1),
    (back_buttons_id, 'RISE4', 'eXtremeRate 4버튼', 10000, 2);
END $$;

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

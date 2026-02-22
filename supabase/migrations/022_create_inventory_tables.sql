-- 재고 관리 테이블 생성
-- 작성일: 2025-02-12

-- 부품 테이블
CREATE TABLE inventory_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,                    -- 부품명
  part_number TEXT UNIQUE,                      -- 부품 번호 (재고관리 번호)
  category TEXT NOT NULL,                       -- 카테고리 (조이스틱, 버튼, 트리거, PCB, 기판, 포장재 등)
  current_stock INTEGER DEFAULT 0,                -- 현재 재고
  min_stock INTEGER DEFAULT 5,                   -- 최소 재고 (부족 알림 기준)
  unit_price INTEGER DEFAULT 0,                   -- 단가
  supplier TEXT,                                -- 공급업체
  location TEXT,                                -- 보관 위치
  is_active BOOLEAN DEFAULT true,                 -- 사용 여부
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 입출고 이력 테이블
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES inventory_parts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                           -- 입고/출고/사용/반품/조정
  quantity INTEGER NOT NULL,                      -- 수량 (+ 입고, - 출고)
  previous_stock INTEGER NOT NULL,                  -- 이전 재고
  new_stock INTEGER NOT NULL,                      -- 이후 재고
  notes TEXT,                                   -- 비고 (수리 신청 ID 등)
  created_by UUID REFERENCES auth.users(id),          -- 작업자
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 재고 알림 테이블
CREATE TABLE inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES inventory_parts(id) ON DELETE CASCADE,
  is_sent BOOLEAN DEFAULT false,                 -- 발송 여부
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책 (관리자만 접근 가능)
ALTER TABLE inventory_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "관리자는 모든 부품 조회 가능" ON inventory_parts
  FOR SELECT USING (true);
  -- 인증된 관리자만 INSERT/UPDATE/DELETE 가능
CREATE POLICY "관리자만 부품 추가/수정/삭제 가능" ON inventory_parts
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@pandaduck.kr'));

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "관리자는 모든 입출고 이력 조회 가능" ON inventory_logs
  FOR SELECT USING (true);
CREATE POLICY "관리자만 입출고 이력 추가 가능" ON inventory_logs
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@pandaduck.kr'));

ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "관리자만 알림 조회/삭제 가능" ON inventory_alerts
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@pandaduck.kr'));

-- 초기 샘플 데이터 (선택사항)
-- 일반적으로 사용하는 부품들 미리 입력
INSERT INTO inventory_parts (part_name, part_number, category, current_stock, min_stock, unit_price) VALUES
  ('조이스틱 모듈 (교체용)', 'STICK-001', '조이스틱', 10, 3, 15000),
  ('조이스틱 모듈 (OEM)', 'STICK-002', '조이스틱', 10, 3, 30000),
  ('버튼 고무', 'BUTTON-001', '버튼', 20, 5, 3000),
  ('버튼 실리콘', 'BUTTON-002', '버튼', 20, 5, 2500),
  ('트리거 스프링', 'TRIGGER-001', '트리거/범퍼', 15, 3, 8000),
  ('범퍼 고무', 'BUMPER-001', '트리거/범퍼', 15, 3, 6000),
  ('완충 charging IC', 'IC-001', '센서', 5, 12000),
  ('이중 모듈 기판', 'PCB-001', 'PCB/기판', 10, 2, 35000),
  ('배터리 충전기 테스트', 'BATTERY-TEST-01', '배터리', 3, 1, 0);

COMMENT ON TABLE inventory_parts IS '부품 재고 테이블';
COMMENT ON TABLE inventory_logs IS '입출고 이력 테이블';
COMMENT ON TABLE inventory_alerts IS '재고 부족 알림 테이블';

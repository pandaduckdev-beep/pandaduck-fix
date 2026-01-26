-- ============================================
-- 매출 관리 시스템
-- ============================================

-- 1. 지출 카테고리 테이블
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280', -- 카테고리 색상 (차트용)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 지출 내역 테이블
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 지출 정보
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount INTEGER NOT NULL, -- 지출 금액 (원)

  -- 상세 정보
  title TEXT NOT NULL, -- 지출 항목명
  description TEXT, -- 상세 설명
  supplier TEXT, -- 공급업체/구매처

  -- 수리 요청 연결 (선택적)
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE SET NULL,

  -- 첨부 파일 (영수증 등)
  receipt_url TEXT,

  -- 메타 정보
  created_by TEXT, -- 작성자
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 기본 지출 카테고리 데이터 삽입
INSERT INTO expense_categories (name, description, color) VALUES
  ('자재비', '수리에 사용되는 부품 및 자재 구매 비용', '#3B82F6'),
  ('공구/장비', '수리 도구 및 장비 구매/유지보수 비용', '#8B5CF6'),
  ('운영비', '임대료, 전기세, 인터넷 등 운영 경비', '#EF4444'),
  ('마케팅', '광고, 홍보, 마케팅 비용', '#F59E0B'),
  ('배송비', '택배, 픽업, 배송 관련 비용', '#10B981'),
  ('기타', '기타 지출', '#6B7280');

-- ============================================
-- 인덱스 생성
-- ============================================

CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_repair_request ON expenses(repair_request_id);
CREATE INDEX idx_expense_categories_active ON expense_categories(is_active);

-- ============================================
-- 매출 통계를 위한 뷰 생성
-- ============================================

-- 일별 매출 통계 뷰
CREATE OR REPLACE VIEW daily_revenue_stats AS
SELECT
  DATE(rr.created_at) as revenue_date,
  COUNT(DISTINCT rr.id) as order_count,
  SUM(rr.total_amount) as total_revenue,
  AVG(rr.total_amount) as avg_order_value,
  COUNT(DISTINCT CASE WHEN rr.status = 'completed' THEN rr.id END) as completed_count
FROM repair_requests rr
WHERE rr.status != 'cancelled'
GROUP BY DATE(rr.created_at)
ORDER BY revenue_date DESC;

-- 월별 매출 통계 뷰
CREATE OR REPLACE VIEW monthly_revenue_stats AS
SELECT
  DATE_TRUNC('month', rr.created_at)::DATE as revenue_month,
  COUNT(DISTINCT rr.id) as order_count,
  SUM(rr.total_amount) as total_revenue,
  AVG(rr.total_amount) as avg_order_value,
  COUNT(DISTINCT CASE WHEN rr.status = 'completed' THEN rr.id END) as completed_count
FROM repair_requests rr
WHERE rr.status != 'cancelled'
GROUP BY DATE_TRUNC('month', rr.created_at)
ORDER BY revenue_month DESC;

-- 일별 지출 통계 뷰
CREATE OR REPLACE VIEW daily_expense_stats AS
SELECT
  expense_date,
  COUNT(*) as expense_count,
  SUM(amount) as total_expenses
FROM expenses
GROUP BY expense_date
ORDER BY expense_date DESC;

-- 월별 지출 통계 뷰
CREATE OR REPLACE VIEW monthly_expense_stats AS
SELECT
  DATE_TRUNC('month', expense_date)::DATE as expense_month,
  COUNT(*) as expense_count,
  SUM(amount) as total_expenses
FROM expenses
GROUP BY DATE_TRUNC('month', expense_date)
ORDER BY expense_month DESC;

-- 월별 순이익 통계 뷰 (매출 - 지출)
CREATE OR REPLACE VIEW monthly_profit_stats AS
SELECT
  COALESCE(r.revenue_month, e.expense_month) as period_month,
  COALESCE(r.total_revenue, 0) as total_revenue,
  COALESCE(e.total_expenses, 0) as total_expenses,
  COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0) as net_profit,
  r.order_count,
  r.completed_count
FROM monthly_revenue_stats r
FULL OUTER JOIN monthly_expense_stats e ON r.revenue_month = e.expense_month
ORDER BY period_month DESC;

-- 카테고리별 지출 통계 뷰
CREATE OR REPLACE VIEW expense_by_category_stats AS
SELECT
  ec.id as category_id,
  ec.name as category_name,
  ec.color as category_color,
  COUNT(e.id) as expense_count,
  SUM(e.amount) as total_amount,
  DATE_TRUNC('month', e.expense_date)::DATE as expense_month
FROM expense_categories ec
LEFT JOIN expenses e ON ec.id = e.category_id
WHERE ec.is_active = true
GROUP BY ec.id, ec.name, ec.color, DATE_TRUNC('month', e.expense_date)
ORDER BY expense_month DESC, total_amount DESC;

-- ============================================
-- 트리거: updated_at 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 코멘트 추가
-- ============================================

COMMENT ON TABLE expense_categories IS '지출 카테고리 관리 테이블';
COMMENT ON TABLE expenses IS '지출 내역 관리 테이블';
COMMENT ON VIEW daily_revenue_stats IS '일별 매출 통계 뷰';
COMMENT ON VIEW monthly_revenue_stats IS '월별 매출 통계 뷰';
COMMENT ON VIEW daily_expense_stats IS '일별 지출 통계 뷰';
COMMENT ON VIEW monthly_expense_stats IS '월별 지출 통계 뷰';
COMMENT ON VIEW monthly_profit_stats IS '월별 순이익 통계 뷰';
COMMENT ON VIEW expense_by_category_stats IS '카테고리별 지출 통계 뷰';

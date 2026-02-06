-- 수리 작업기 테이블 생성
-- 수리 작업 과정을 블로그 형식으로 기록하는 테이블

CREATE TABLE IF NOT EXISTS repair_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(500),
  thumbnail_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  controller_model VARCHAR(100),
  repair_type VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  naver_blog_url TEXT,
  naver_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_repair_logs_is_public ON repair_logs(is_public);
CREATE INDEX idx_repair_logs_created_at ON repair_logs(created_at DESC);
CREATE INDEX idx_repair_logs_controller_model ON repair_logs(controller_model);

-- RLS 활성화
ALTER TABLE repair_logs ENABLE ROW LEVEL SECURITY;

-- 공개된 작업기만 누구나 조회 가능
CREATE POLICY "Anyone can read public repair logs"
ON repair_logs FOR SELECT
USING (is_public = true);

-- 인증된 사용자(관리자)는 모든 작업 가능
CREATE POLICY "Authenticated users can manage repair logs"
ON repair_logs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_repair_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER repair_logs_updated_at
  BEFORE UPDATE ON repair_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_repair_logs_updated_at();

-- 코멘트
COMMENT ON TABLE repair_logs IS '수리 작업기 - 수리 과정을 블로그 형식으로 기록';
COMMENT ON COLUMN repair_logs.title IS '글 제목';
COMMENT ON COLUMN repair_logs.content IS '본문 내용 (HTML 또는 Markdown)';
COMMENT ON COLUMN repair_logs.summary IS '요약 (목록에 표시)';
COMMENT ON COLUMN repair_logs.thumbnail_url IS '썸네일 이미지 URL';
COMMENT ON COLUMN repair_logs.image_urls IS '본문 이미지 URL 배열';
COMMENT ON COLUMN repair_logs.controller_model IS '컨트롤러 모델명';
COMMENT ON COLUMN repair_logs.repair_type IS '수리 유형 (예: 버튼 수리, 스틱 교체 등)';
COMMENT ON COLUMN repair_logs.is_public IS '공개 여부';
COMMENT ON COLUMN repair_logs.view_count IS '조회수';
COMMENT ON COLUMN repair_logs.naver_blog_url IS '네이버 블로그 발행 URL';
COMMENT ON COLUMN repair_logs.naver_synced_at IS '네이버 블로그 발행 시간';

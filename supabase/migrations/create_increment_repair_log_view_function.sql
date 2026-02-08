-- PandaDuckFix: 작업기 조회수 증가 RPC 함수
-- 실행 방법: Supabase Dashboard → SQL Editor에서 이 스크립트를 실행하세요.

-- 함수 생성 (또는 교체)
CREATE OR REPLACE FUNCTION increment_repair_log_view(log_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_views INTEGER;
BEGIN
  -- 조회수 1 증가
  UPDATE repair_logs
  SET view_count = view_count + 1
  WHERE id = log_id
  RETURNING view_count INTO current_views;

  RETURN current_views;
END;
$$;

-- 권한 부여 (필요한 경우)
-- 인증된 사용자와 익명 사용자 모두 호출 가능
GRANT EXECUTE ON FUNCTION increment_repair_log_view(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_repair_log_view(UUID) TO anon;

-- 함수 설명을 위한 코멘트
COMMENT ON FUNCTION increment_repair_log_view IS '작업기 게시글의 조회수를 1 증가시키고 증가된 조회수를 반환합니다.';

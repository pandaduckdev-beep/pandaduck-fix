-- repair_requests 테이블의 선택적 필드가 NULL을 허용하는지 확인
-- 이미 스키마에서 NULL 허용으로 되어 있지만, 명시적으로 재확인

-- 선택적 필드들을 명시적으로 NULL 허용으로 설정
ALTER TABLE repair_requests
  ALTER COLUMN customer_email DROP NOT NULL,
  ALTER COLUMN issue_description DROP NOT NULL,
  ALTER COLUMN estimated_completion_date DROP NOT NULL,
  ALTER COLUMN actual_completion_date DROP NOT NULL,
  ALTER COLUMN admin_notes DROP NOT NULL,
  ALTER COLUMN review_token DROP NOT NULL,
  ALTER COLUMN review_sent_at DROP NOT NULL;

-- 참고: 이미 NULL 허용인 컬럼에 대해 DROP NOT NULL을 실행해도 오류가 발생하지 않습니다.

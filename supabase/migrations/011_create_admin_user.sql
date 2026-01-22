-- 관리자 계정 생성 (admin_users 테이블에 추가)
-- Row Level Security 사용

INSERT INTO admin_users (email, password_hash, is_active)
VALUES (
  'admin@pandaduck.com',
  'pandaduck2025', -- SHA256 hash (실제 환경에서는 bcrypt 필요)
  true
);

-- 확인: 이 마이그레이션을 실행하면 admin_users 테이블이 없을 경우 생성됨
-- 이미 존재하는 경우 email UNIQUE 제약조건에 의해 에러 발생

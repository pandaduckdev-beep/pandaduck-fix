-- 관리자 계정 생성
-- Row Level Security 사용을 위한 테이블

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 인덱스 생성 (이미 있으면 무시됨)
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- 기존 관리자 계정 생성
INSERT INTO admin_users (email, password_hash, is_active)
SELECT
  'admin@pandaduck.com',
  'pandaduck2025',  -- 실제 서비스에서는 bcrypt hashing 필요
  true
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE email = 'admin@pandaduck.com'
);

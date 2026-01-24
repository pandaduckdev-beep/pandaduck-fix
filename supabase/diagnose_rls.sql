-- 1. 현재 로그인된 사용자 확인
SELECT auth.uid(), auth.email(), auth.role()
FROM auth.users;

-- 2. admin_users 테이블에 관리자 목록 확인
SELECT id, email, password_hash, is_active
FROM admin_users;

-- 3. 현재 인증 상태와 admin_users 비교
-- 참고: 현재 로그인된 사용자의 email이 admin_users.email과 일치해야 함

-- 4. controller_services RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    roles
FROM pg_policies
WHERE tablename = 'controller_services';

-- 5. controller_service_options RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    roles
FROM pg_policies
WHERE tablename = 'controller_service_options';

-- 6. 관리자가 없으면 임시로 추가 (테스트용)
-- ⚠️ 프로덕션에서는 사용하지 마세요!
-- password는 bcrypt hash: 'admin123'의 bcrypt 해시입니다
INSERT INTO admin_users (email, password_hash, is_active)
VALUES ('test-admin@example.com', '$2a$12$LQv3aH8v.0l5.5K9YiZL1Wz.5FqJYvzW9z5FqJYvzW9z5FqJYvzW9z', true)
ON CONFLICT (email) DO NOTHING;

-- 7. RLS 정책 일시 비활성화 (테스트용 - 개발환경에서만)
-- ⚠️ 프로덕션에서는 사용하지 마세요!
ALTER TABLE controller_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE controller_service_options DISABLE ROW LEVEL SECURITY;

-- 8. 권한 확인
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('controller_services', 'controller_service_options')
ORDER BY table_name, privilege_type;

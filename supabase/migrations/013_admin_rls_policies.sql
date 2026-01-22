-- 관리자 페이지를 위한 RLS 정책 추가
-- services, service_options, repair_requests 등의 테이블에 관리자 접근 허용

-- 1. services 테이블에 대한 RLS 정책
-- SELECT 정책: 모든 사용자가 조회 가능
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  USING (true);

-- INSERT 정책: 인증된 사용자만 추가 가능
DROP POLICY IF EXISTS "Authenticated users can insert services" ON services;
CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE 정책: 인증된 사용자만 수정 가능
DROP POLICY IF EXISTS "Authenticated users can update services" ON services;
CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE 정책: 인증된 사용자만 삭제 가능
DROP POLICY IF EXISTS "Authenticated users can delete services" ON services;
CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 2. service_options 테이블에 대한 RLS 정책
-- SELECT 정책: 모든 사용자가 조회 가능
DROP POLICY IF EXISTS "Anyone can view service options" ON service_options;
CREATE POLICY "Anyone can view service options"
  ON service_options FOR SELECT
  USING (true);

-- INSERT 정책: 인증된 사용자만 추가 가능
DROP POLICY IF EXISTS "Authenticated users can insert service options" ON service_options;
CREATE POLICY "Authenticated users can insert service options"
  ON service_options FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE 정책: 인증된 사용자만 수정 가능
DROP POLICY IF EXISTS "Authenticated users can update service options" ON service_options;
CREATE POLICY "Authenticated users can update service options"
  ON service_options FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE 정책: 인증된 사용자만 삭제 가능
DROP POLICY IF EXISTS "Authenticated users can delete service options" ON service_options;
CREATE POLICY "Authenticated users can delete service options"
  ON service_options FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 3. admin_users 테이블에 대한 RLS 정책
-- SELECT 정책: 인증된 사용자만 조회 가능
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT 정책: 인증된 사용자만 추가 가능
DROP POLICY IF EXISTS "Authenticated users can insert admin users" ON admin_users;
CREATE POLICY "Authenticated users can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE 정책: 인증된 사용자만 수정 가능
DROP POLICY IF EXISTS "Authenticated users can update admin users" ON admin_users;
CREATE POLICY "Authenticated users can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE 정책: 인증된 사용자만 삭제 가능
DROP POLICY IF EXISTS "Authenticated users can delete admin users" ON admin_users;
CREATE POLICY "Authenticated users can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 개발 환경용 RLS 정책 완화
-- admin_users 테이블 사용 시 인증 확인 불가능한 문제 해결

-- 1. services 테이블 RLS 정책 완화
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  USING (true); -- 개발 환경에서는 모두 접근 가능

DROP POLICY IF EXISTS "Authenticated users can insert services" ON services;
CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true); -- 개발 환경에서는 인증 사용자만 추가 가능

DROP POLICY IF EXISTS "Authenticated users can update services" ON services;
CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete services" ON services;
CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- 2. service_options 테이블 RLS 정책 완화
DROP POLICY IF EXISTS "Anyone can view service options" ON service_options;
CREATE POLICY "Anyone can view service options"
  ON service_options FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert service options" ON service_options;
CREATE POLICY "Authenticated users can insert service options"
  ON service_options FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update service options" ON service_options;
CREATE POLICY "Authenticated users can update service options"
  ON service_options FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete service options" ON service_options;
CREATE POLICY "Authenticated users can delete service options"
  ON service_options FOR DELETE
  TO authenticated
  USING (true);

-- 3. admin_users 테이블 RLS 정책 완화
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert admin users" ON admin_users;
CREATE POLICY "Authenticated users can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update admin users" ON admin_users;
CREATE POLICY "Authenticated users can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete admin users" ON admin_users;
CREATE POLICY "Authenticated users can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);

-- 4. controller_models RLS 정책 완화
DROP POLICY IF EXISTS "view_controller_models" ON controller_models;
CREATE POLICY "view_controller_models"
  ON controller_models FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "insert_controller_models" ON controller_models;
CREATE POLICY "insert_controller_models"
  ON controller_models FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "update_controller_models" ON controller_models;
CREATE POLICY "update_controller_models"
  ON controller_models FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "delete_controller_models" ON controller_models;
CREATE POLICY "delete_controller_models"
  ON controller_models FOR DELETE
  TO authenticated
  USING (true);

-- 5. controller_service_pricing RLS 정책 완화
DROP POLICY IF EXISTS "view_controller_service_pricing" ON controller_service_pricing;
CREATE POLICY "view_controller_service_pricing"
  ON controller_service_pricing FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "insert_controller_service_pricing" ON controller_service_pricing;
CREATE POLICY "insert_controller_service_pricing"
  ON controller_service_pricing FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "update_controller_service_pricing" ON controller_service_pricing;
CREATE POLICY "update_controller_service_pricing"
  ON controller_service_pricing FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "delete_controller_service_pricing" ON controller_service_pricing;
CREATE POLICY "delete_controller_service_pricing"
  ON controller_service_pricing FOR DELETE
  TO authenticated
  USING (true);

-- 6. controller_option_pricing RLS 정책 완화
DROP POLICY IF EXISTS "view_controller_option_pricing" ON controller_option_pricing;
CREATE POLICY "view_controller_option_pricing"
  ON controller_option_pricing FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "insert_controller_option_pricing" ON controller_option_pricing;
CREATE POLICY "insert_controller_option_pricing"
  ON controller_option_pricing FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "update_controller_option_pricing" ON controller_option_pricing;
CREATE POLICY "update_controller_option_pricing"
  ON controller_option_pricing FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "delete_controller_option_pricing" ON controller_option_pricing;
CREATE POLICY "delete_controller_option_pricing"
  ON controller_option_pricing FOR DELETE
  TO authenticated
  USING (true);

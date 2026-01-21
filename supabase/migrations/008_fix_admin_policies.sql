-- 모든 기존 정책 제거 후 새로운 정책 생성
-- 관리자를 위한 RLS 정책 수정

-- 1. controller_models 테이블의 모든 정책 제거
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'controller_models'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON controller_models', pol.policyname);
    END LOOP;
END $$;

-- 새로운 SELECT 정책: 인증된 사용자는 모든 컨트롤러를 볼 수 있고, 비인증 사용자는 활성만
CREATE POLICY "view_controller_models"
  ON controller_models FOR SELECT
  USING (
    CASE
      WHEN auth.uid() IS NOT NULL THEN true  -- 인증된 사용자는 모두 볼 수 있음
      ELSE is_active = true  -- 인증되지 않은 사용자는 활성만
    END
  );

-- INSERT 정책
CREATE POLICY "insert_controller_models"
  ON controller_models FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE 정책
CREATE POLICY "update_controller_models"
  ON controller_models FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE 정책
CREATE POLICY "delete_controller_models"
  ON controller_models FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 2. controller_service_pricing 테이블의 모든 정책 제거
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'controller_service_pricing'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON controller_service_pricing', pol.policyname);
    END LOOP;
END $$;

-- SELECT 정책
CREATE POLICY "view_controller_service_pricing"
  ON controller_service_pricing FOR SELECT
  USING (
    CASE
      WHEN auth.uid() IS NOT NULL THEN true
      ELSE is_available = true
    END
  );

-- INSERT 정책
CREATE POLICY "insert_controller_service_pricing"
  ON controller_service_pricing FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE 정책
CREATE POLICY "update_controller_service_pricing"
  ON controller_service_pricing FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE 정책
CREATE POLICY "delete_controller_service_pricing"
  ON controller_service_pricing FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 3. controller_option_pricing 테이블의 모든 정책 제거
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'controller_option_pricing'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON controller_option_pricing', pol.policyname);
    END LOOP;
END $$;

-- SELECT 정책
CREATE POLICY "view_controller_option_pricing"
  ON controller_option_pricing FOR SELECT
  USING (
    CASE
      WHEN auth.uid() IS NOT NULL THEN true
      ELSE is_available = true
    END
  );

-- INSERT 정책
CREATE POLICY "insert_controller_option_pricing"
  ON controller_option_pricing FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE 정책
CREATE POLICY "update_controller_option_pricing"
  ON controller_option_pricing FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE 정책
CREATE POLICY "delete_controller_option_pricing"
  ON controller_option_pricing FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

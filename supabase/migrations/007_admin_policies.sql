-- 관리자를 위한 RLS 정책 추가
-- 인증된 사용자(관리자)가 모든 작업을 수행할 수 있도록 설정

-- 1. controller_models 테이블 정책
-- 기존 SELECT 정책 삭제 및 새로운 정책 추가
DROP POLICY IF EXISTS "Controller models are viewable by everyone" ON controller_models;
DROP POLICY IF EXISTS "Anyone can view active controller models" ON controller_models;

-- 인증된 사용자는 모든 컨트롤러를 볼 수 있고, 인증되지 않은 사용자는 활성 컨트롤러만 볼 수 있음
CREATE POLICY "Anyone can view controller models"
  ON controller_models FOR SELECT
  USING (
    CASE
      WHEN auth.uid() IS NOT NULL THEN true  -- 인증된 사용자는 모두 볼 수 있음
      ELSE is_active = true  -- 인증되지 않은 사용자는 활성만
    END
  );

-- 인증된 사용자는 컨트롤러를 추가/수정/삭제할 수 있음
DROP POLICY IF EXISTS "Authenticated users can insert controller models" ON controller_models;
CREATE POLICY "Authenticated users can insert controller models"
  ON controller_models FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update controller models" ON controller_models;
CREATE POLICY "Authenticated users can update controller models"
  ON controller_models FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete controller models" ON controller_models;
CREATE POLICY "Authenticated users can delete controller models"
  ON controller_models FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 2. controller_service_pricing 테이블 정책
DROP POLICY IF EXISTS "Controller service pricing is viewable by everyone" ON controller_service_pricing;
DROP POLICY IF EXISTS "Anyone can view available controller service pricing" ON controller_service_pricing;

-- 가격 정보 조회 정책
CREATE POLICY "Anyone can view controller service pricing"
  ON controller_service_pricing FOR SELECT
  USING (
    CASE
      WHEN auth.uid() IS NOT NULL THEN true
      ELSE is_available = true
    END
  );

-- 인증된 사용자는 가격 정보를 추가/수정/삭제할 수 있음
DROP POLICY IF EXISTS "Authenticated users can insert controller service pricing" ON controller_service_pricing;
CREATE POLICY "Authenticated users can insert controller service pricing"
  ON controller_service_pricing FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update controller service pricing" ON controller_service_pricing;
CREATE POLICY "Authenticated users can update controller service pricing"
  ON controller_service_pricing FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete controller service pricing" ON controller_service_pricing;
CREATE POLICY "Authenticated users can delete controller service pricing"
  ON controller_service_pricing FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 3. controller_option_pricing 테이블 정책
DROP POLICY IF EXISTS "Controller option pricing is viewable by everyone" ON controller_option_pricing;
DROP POLICY IF EXISTS "Anyone can view available controller option pricing" ON controller_option_pricing;

-- 옵션 가격 정보 조회 정책
CREATE POLICY "Anyone can view controller option pricing"
  ON controller_option_pricing FOR SELECT
  USING (
    CASE
      WHEN auth.uid() IS NOT NULL THEN true
      ELSE is_available = true
    END
  );

-- 인증된 사용자는 옵션 가격 정보를 추가/수정/삭제할 수 있음
DROP POLICY IF EXISTS "Authenticated users can insert controller option pricing" ON controller_option_pricing;
CREATE POLICY "Authenticated users can insert controller option pricing"
  ON controller_option_pricing FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update controller option pricing" ON controller_option_pricing;
CREATE POLICY "Authenticated users can update controller option pricing"
  ON controller_option_pricing FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete controller option pricing" ON controller_option_pricing;
CREATE POLICY "Authenticated users can delete controller option pricing"
  ON controller_option_pricing FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

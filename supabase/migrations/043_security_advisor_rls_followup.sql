DO $$
DECLARE
  pol RECORD;
  qual_normalized TEXT;
  check_normalized TEXT;
  role_expr TEXT;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('repair_request_services', 'repair_requests', 'reviews', 'service_combos')
  LOOP
    qual_normalized := regexp_replace(coalesce(pol.qual, ''), '[[:space:]()]', '', 'g');
    check_normalized := regexp_replace(coalesce(pol.with_check, ''), '[[:space:]()]', '', 'g');

    role_expr := NULL;

    IF 'public'::name = ANY (pol.roles)
       OR ('anon'::name = ANY (pol.roles) AND 'authenticated'::name = ANY (pol.roles)) THEN
      role_expr := '(auth.role() = ''anon'' OR auth.role() = ''authenticated'')';
    ELSIF 'authenticated'::name = ANY (pol.roles) THEN
      role_expr := '(auth.role() = ''authenticated'')';
    ELSIF 'anon'::name = ANY (pol.roles) THEN
      role_expr := '(auth.role() = ''anon'')';
    END IF;

    IF role_expr IS NULL THEN
      CONTINUE;
    END IF;

    IF qual_normalized = 'true' THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING %s',
        pol.policyname,
        pol.schemaname,
        pol.tablename,
        role_expr
      );
    END IF;

    IF check_normalized = 'true' THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK %s',
        pol.policyname,
        pol.schemaname,
        pol.tablename,
        role_expr
      );
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'daily_revenue_stats'
  ) THEN
    EXECUTE 'ALTER VIEW public.daily_revenue_stats SET (security_invoker = true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'monthly_revenue_stats'
  ) THEN
    EXECUTE 'ALTER VIEW public.monthly_revenue_stats SET (security_invoker = true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'daily_expense_stats'
  ) THEN
    EXECUTE 'ALTER VIEW public.daily_expense_stats SET (security_invoker = true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'monthly_expense_stats'
  ) THEN
    EXECUTE 'ALTER VIEW public.monthly_expense_stats SET (security_invoker = true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'expense_by_category_stats'
  ) THEN
    EXECUTE 'ALTER VIEW public.expense_by_category_stats SET (security_invoker = true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'monthly_profit_stats'
  ) THEN
    EXECUTE 'ALTER VIEW public.monthly_profit_stats SET (security_invoker = true)';
  END IF;
END $$;

DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_repair_logs_updated_at',
        'increment_repair_log_view',
        'generate_review_token',
        'change_repair_request_status',
        'update_service_combos_updated_at',
        'update_updated_at_column'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn.signature);
  END LOOP;
END $$;

DO $$
DECLARE
  pol RECORD;
  qual_normalized TEXT;
  check_normalized TEXT;
BEGIN
  FOR pol IN
    SELECT
      p.schemaname,
      p.tablename,
      p.policyname,
      p.roles,
      p.qual,
      p.with_check
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND ('authenticated'::name = ANY (p.roles))
  LOOP
    qual_normalized := regexp_replace(coalesce(pol.qual, ''), '[[:space:]()]', '', 'g');
    check_normalized := regexp_replace(coalesce(pol.with_check, ''), '[[:space:]()]', '', 'g');

    IF qual_normalized = 'true' AND 'authenticated'::name = ANY (pol.roles) THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING (auth.role() = ''authenticated'')',
        pol.policyname,
        pol.schemaname,
        pol.tablename
      );
    END IF;

    IF check_normalized = 'true' AND 'authenticated'::name = ANY (pol.roles) THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK (auth.role() = ''authenticated'')',
        pol.policyname,
        pol.schemaname,
        pol.tablename
      );
    END IF;
  END LOOP;
END $$;

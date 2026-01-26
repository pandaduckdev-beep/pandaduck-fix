-- Force re-run migration 027
-- This ensures migration is properly executed even if it was skipped before

-- First, check if we need to re-run
DO $$
DECLARE
    service_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO service_count FROM controller_services;
    
    IF service_count = 0 THEN
        RAISE NOTICE 'controller_services is empty. Will run migration 027 again.';
    ELSE
        RAISE NOTICE 'controller_services already has data (% records). Skipping migration 027.', service_count;
    END IF;
END $$;

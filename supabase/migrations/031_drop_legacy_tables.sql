-- ============================================
-- Drop Legacy Tables: services and service_options
-- ============================================
-- This migration removes the old services and service_options tables
-- as the application now uses controller_services and controller_service_options
--
-- WARNING: This will permanently delete these tables and all their data!
--
-- Prerequisites:
-- - Migration 027 must have been completed (data migrated to controller_services)
-- - Migration 029 must have been completed (orphaned records cleaned up)
-- ============================================

-- Step 1: Drop foreign key constraints from repair_request_services
-- ============================================

-- Drop foreign key constraint on service_id (references services.id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'repair_request_services_service_id_fkey'
        AND conrelid = 'repair_request_services'::regclass
    ) THEN
        ALTER TABLE repair_request_services
        DROP CONSTRAINT repair_request_services_service_id_fkey;

        RAISE NOTICE 'Dropped foreign key: repair_request_services_service_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint repair_request_services_service_id_fkey not found, skipping...';
    END IF;
END $$;

-- Drop foreign key constraint on selected_option_id (references service_options.id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'repair_request_services_selected_option_id_fkey'
        AND conrelid = 'repair_request_services'::regclass
    ) THEN
        ALTER TABLE repair_request_services
        DROP CONSTRAINT repair_request_services_selected_option_id_fkey;

        RAISE NOTICE 'Dropped foreign key: repair_request_services_selected_option_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint repair_request_services_selected_option_id_fkey not found, skipping...';
    END IF;
END $$;

-- Step 2: Drop indexes related to services and service_options
-- ============================================

DO $$
BEGIN
    DROP INDEX IF EXISTS idx_services_service_id;
    RAISE NOTICE 'Dropped index: idx_services_service_id';

    DROP INDEX IF EXISTS idx_services_active;
    RAISE NOTICE 'Dropped index: idx_services_active';

    DROP INDEX IF EXISTS idx_service_options_service;
    RAISE NOTICE 'Dropped index: idx_service_options_service';
END $$;

-- Step 3: Drop trigger on services table
-- ============================================

DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_services_updated_at ON services;
    RAISE NOTICE 'Dropped trigger: update_services_updated_at';
END $$;

-- Step 4: Drop service_options table
-- ============================================

DO $$
BEGIN
    DROP TABLE IF EXISTS service_options CASCADE;
    RAISE NOTICE 'Dropped table: service_options';
END $$;

-- Step 5: Drop services table
-- ============================================

DO $$
BEGIN
    DROP TABLE IF EXISTS services CASCADE;
    RAISE NOTICE 'Dropped table: services';
END $$;

-- ============================================
-- Migration Complete
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 031 completed successfully!';
    RAISE NOTICE 'Legacy tables dropped:';
    RAISE NOTICE '  - service_options';
    RAISE NOTICE '  - services';
    RAISE NOTICE '========================================';
END $$;

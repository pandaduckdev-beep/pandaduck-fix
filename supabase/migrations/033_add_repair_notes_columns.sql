-- Add pre_repair_notes and post_repair_notes columns to repair_requests
-- ============================================
-- This migration adds columns for repair-related notes to track
-- specific conditions before and after repair work
-- ============================================

DO $$
BEGIN
    -- Add pre_repair_notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'repair_requests'
        AND column_name = 'pre_repair_notes'
    ) THEN
        ALTER TABLE repair_requests ADD COLUMN pre_repair_notes TEXT;

        RAISE NOTICE 'Added column: pre_repair_notes';
    ELSE
        RAISE NOTICE 'Column pre_repair_notes already exists, skipping...';
    END IF;

    -- Add post_repair_notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'repair_requests'
        AND column_name = 'post_repair_notes'
    ) THEN
        ALTER TABLE repair_requests ADD COLUMN post_repair_notes TEXT;

        RAISE NOTICE 'Added column: post_repair_notes';
    ELSE
        RAISE NOTICE 'Column post_repair_notes already exists, skipping...';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 033 completed successfully!';
    RAISE NOTICE '========================================';
END $$;

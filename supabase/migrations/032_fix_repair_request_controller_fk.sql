-- Fix repair_requests.controller_model to use FK reference to controller_models.id
-- ============================================
-- This migration fixes the controller_model column in repair_requests table
-- to properly reference controller_models.id as a foreign key
--
-- Issue: repair_requests.controller_model currently stores model_id as TEXT (e.g., 'dualsense')
--        but needs to store controller_models.id as UUID for proper FK reference
-- ============================================

DO $$
BEGIN
    -- Step 1: Drop NOT NULL constraint temporarily (in case of data issues)
    ALTER TABLE repair_requests ALTER COLUMN controller_model DROP NOT NULL;

    RAISE NOTICE 'Dropped NOT NULL constraint from controller_model';

    -- Step 2: Convert existing data from model_id to controller_models.id
    -- repair_requests.controller_model stores TEXT values like 'dualsense', 'dualsense-edge'
    -- We need to convert these to the corresponding controller_models.id UUID
    UPDATE repair_requests rr
    SET controller_model = cm.id::text
    FROM controller_models cm
    WHERE rr.controller_model = cm.model_id
    AND rr.controller_model NOT IN (SELECT id::text FROM controller_models);

    RAISE NOTICE 'Converted repair_requests.controller_model from model_id to controller_models.id';

    -- Step 3: Change column type from TEXT to UUID
    ALTER TABLE repair_requests ALTER COLUMN controller_model TYPE UUID USING controller_model::UUID;

    RAISE NOTICE 'Changed controller_model column type from TEXT to UUID';

    -- Step 4: Restore NOT NULL constraint
    ALTER TABLE repair_requests ALTER COLUMN controller_model SET NOT NULL;

    RAISE NOTICE 'Restored NOT NULL constraint on controller_model';

    -- Step 5: Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'repair_requests_controller_model_fkey'
        AND conrelid = 'repair_requests'::regclass
    ) THEN
        ALTER TABLE repair_requests
        ADD CONSTRAINT repair_requests_controller_model_fkey
        FOREIGN KEY (controller_model) REFERENCES controller_models(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;

        RAISE NOTICE 'Added foreign key constraint: repair_requests_controller_model_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists, skipping...';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 032 completed successfully!';
    RAISE NOTICE '========================================';
END $$;

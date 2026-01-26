-- Verify migration status
-- Run this query to check if migration 027 was executed successfully

-- Check if controller_services has data
SELECT
    COUNT(*) as service_count,
    'Migrated' as status,
    CASE
        WHEN COUNT(*) > 0 THEN 'Migration completed'
        ELSE 'Not migrated yet'
    END as message
FROM controller_services;

-- Check if controller_service_options has data
SELECT
    COUNT(*) as option_count,
    'Migrated' as status,
    CASE
        WHEN COUNT(*) > 0 THEN 'Migration completed'
        ELSE 'Not migrated yet'
    END as message
FROM controller_service_options;

-- Check current controller_services data (show sample)
SELECT
    id,
    controller_model_id,
    service_id,
    name
FROM controller_services
LIMIT 5;

-- Check what services.id was (from old table)
SELECT
    id,
    service_id,
    name
FROM services
LIMIT 5;

-- Check foreign key constraints
SELECT
    con.conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint con
WHERE con.conrelid::regclass::text = 'repair_request_services';

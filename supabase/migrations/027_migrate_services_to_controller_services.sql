-- Migrate services to controller_services table
-- This migration copies data from old services table to new controller_services table
-- ensuring data consistency for foreign key references

DO $$
DECLARE
    default_controller_id UUID;
    migration_count INTEGER;
BEGIN
    -- Check if controller_services already has data
    SELECT COUNT(*) INTO migration_count FROM controller_services;
    
    IF migration_count > 0 THEN
        RAISE NOTICE 'controller_services already has data. Skipping migration.';
    ELSE
        -- Get default controller model ID (DualSense)
        SELECT id INTO default_controller_id FROM controller_models
        WHERE model_id = 'dualsense'
        LIMIT 1;
        
        -- If no default controller, skip migration
        IF default_controller_id IS NULL THEN
            RAISE NOTICE 'No default controller model found. Skipping migration.';
        ELSE
            -- Direct INSERT from services to controller_services
            -- Creates new records with proper UUIDs in controller_services table
            INSERT INTO controller_services (
                id,
                controller_model_id,
                service_id,
                name,
                description,
                base_price,
                is_active,
                display_order
            )
            SELECT
                gen_random_uuid(),                           -- Generate new UUID for controller_services
                default_controller_id,                       -- Assign to default controller
                s.service_id,                                -- Copy service_id (TEXT)
                s.name,
                s.description,
                s.base_price::DECIMAL(10,2),
                s.is_active,
                s.display_order
            FROM services s;

            RAISE NOTICE 'Copied % services to controller_services', migration_count;
        END IF;
    END IF;
END $$;

-- Now migrate service options to controller_service_options
DO $$
DECLARE
    option_count INTEGER;
BEGIN
    -- Check if already migrated
    SELECT COUNT(*) INTO option_count FROM controller_service_options;
    
    IF option_count > 0 THEN
        RAISE NOTICE 'controller_service_options already has data. Skipping migration.';
    ELSE
        -- Insert options, linking to the new controller_services records
        INSERT INTO controller_service_options (
            id,
                controller_service_id,
                option_name,
                option_description,
                additional_price,
                is_active,
                display_order
            )
        SELECT
            gen_random_uuid(),                    -- Generate new UUID for controller_service_options
            cs.id,                               -- Reference controller_services.id
            so.option_name,
            so.option_description,
            so.additional_price,
            so.is_active,
            so.display_order
        FROM service_options so
        INNER JOIN services s ON so.service_id = s.id
        INNER JOIN controller_services cs ON cs.service_id = s.service_id
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Migrated % options to controller_service_options', option_count;
    END IF;
END $$;

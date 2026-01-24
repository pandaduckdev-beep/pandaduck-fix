-- Create controller_services table for controller-specific independent services
CREATE TABLE IF NOT EXISTS controller_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    controller_model_id UUID NOT NULL REFERENCES controller_models(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create controller_service_options table for controller-specific independent options
CREATE TABLE IF NOT EXISTS controller_service_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    controller_service_id UUID NOT NULL REFERENCES controller_services(id) ON DELETE CASCADE,
    option_name TEXT NOT NULL,
    option_description TEXT,
    additional_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_controller_services_controller_model_id ON controller_services(controller_model_id);
CREATE INDEX IF NOT EXISTS idx_controller_services_display_order ON controller_services(display_order);
CREATE INDEX IF NOT EXISTS idx_controller_services_is_active ON controller_services(is_active);

-- Add unique constraint for controller_model_id + service_id combination
CREATE UNIQUE INDEX IF NOT EXISTS uniq_controller_services_controller_service
ON controller_services(controller_model_id, service_id);

CREATE INDEX IF NOT EXISTS idx_controller_service_options_controller_service_id ON controller_service_options(controller_service_id);
CREATE INDEX IF NOT EXISTS idx_controller_service_options_is_active ON controller_service_options(is_active);

-- Enable RLS
ALTER TABLE controller_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_service_options ENABLE ROW LEVEL SECURITY;

-- Create policies for controller_services (allow admins full access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'controller_services' AND policyname = 'Allow full access to admins for controller_services'
  ) THEN
    CREATE POLICY "Allow full access to admins for controller_services"
    ON controller_services
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.email()
            AND admin_users.is_active = true
        )
    );
  END IF;
END $$;

-- Create policies for controller_service_options (allow admins full access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'controller_service_options' AND policyname = 'Allow full access to admins for controller_service_options'
  ) THEN
    CREATE POLICY "Allow full access to admins for controller_service_options"
    ON controller_service_options
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.email()
            AND admin_users.is_active = true
        )
    );
  END IF;
END $$;

-- Create trigger for updated_at on controller_services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_controller_services_updated_at'
  ) THEN
    CREATE TRIGGER update_controller_services_updated_at
    BEFORE UPDATE ON controller_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create trigger for updated_at on controller_service_options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_controller_service_options_updated_at'
  ) THEN
    CREATE TRIGGER update_controller_service_options_updated_at
    BEFORE UPDATE ON controller_service_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

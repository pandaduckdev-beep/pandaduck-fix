-- Create admin_login_logs table for tracking login attempts
CREATE TABLE IF NOT EXISTS admin_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_email ON admin_login_logs(email);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_timestamp ON admin_login_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_success ON admin_login_logs(success);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_user_id ON admin_login_logs(user_id);

-- Add comment
COMMENT ON TABLE admin_login_logs IS 'Logs all admin login attempts for security monitoring';
COMMENT ON COLUMN admin_login_logs.success IS 'Whether the login attempt was successful';
COMMENT ON COLUMN admin_login_logs.user_id IS 'User ID from Supabase Auth if login was successful';
COMMENT ON COLUMN admin_login_logs.ip_address IS 'IP address of the login attempt';
COMMENT ON COLUMN admin_login_logs.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN admin_login_logs.error_message IS 'Error message if login failed';

-- Enable Row Level Security
ALTER TABLE admin_login_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view logs
CREATE POLICY "Authenticated users can view login logs"
ON admin_login_logs
FOR SELECT
TO authenticated
USING (true);

-- Policy: Anyone can insert login logs (for tracking failed attempts)
CREATE POLICY "Anyone can insert login logs"
ON admin_login_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

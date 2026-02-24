CREATE TABLE IF NOT EXISTS message_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'solapi',
  provider_message_id TEXT,
  provider_response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE message_dispatch_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read message dispatch logs" ON message_dispatch_logs;
DROP POLICY IF EXISTS "Authenticated users can insert message dispatch logs" ON message_dispatch_logs;

CREATE POLICY "Authenticated users can read message dispatch logs"
ON message_dispatch_logs FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert message dispatch logs"
ON message_dispatch_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_message_dispatch_logs_repair_request_id
ON message_dispatch_logs(repair_request_id);

CREATE INDEX IF NOT EXISTS idx_message_dispatch_logs_created_at
ON message_dispatch_logs(created_at DESC);

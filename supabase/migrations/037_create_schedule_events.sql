CREATE TABLE IF NOT EXISTS schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('repair', 'purchase', 'shipping', 'customer_support', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'delayed', 'completed', 'cancelled')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  assignee TEXT,
  memo TEXT,
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_events_start_at ON schedule_events(start_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_events_type_status ON schedule_events(event_type, status);
CREATE INDEX IF NOT EXISTS idx_schedule_events_repair_request_id ON schedule_events(repair_request_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schedule_events_updated_at
  BEFORE UPDATE ON schedule_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read schedule events" ON schedule_events;
CREATE POLICY "Authenticated users can read schedule events"
  ON schedule_events
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create schedule events" ON schedule_events;
CREATE POLICY "Authenticated users can create schedule events"
  ON schedule_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update schedule events" ON schedule_events;
CREATE POLICY "Authenticated users can update schedule events"
  ON schedule_events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete schedule events" ON schedule_events;
CREATE POLICY "Authenticated users can delete schedule events"
  ON schedule_events
  FOR DELETE
  TO authenticated
  USING (true);

COMMENT ON TABLE schedule_events IS '관리자 일정 관리 이벤트 테이블';

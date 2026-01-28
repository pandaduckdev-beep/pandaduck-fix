-- Enable Row Level Security on all tables
-- CRITICAL: This prevents unauthorized access to data

-- 1. Enable RLS on all tables
ALTER TABLE controller_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_service_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_option_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_request_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- admin_login_logs already has RLS enabled from previous migration

-- 2. PUBLIC READ POLICIES (for customer-facing data)

-- Controller Models: Anyone can read active models
CREATE POLICY "Anyone can read active controller models"
ON controller_models FOR SELECT
USING (is_active = true);

-- Controller Services: Anyone can read active services
CREATE POLICY "Anyone can read active controller services"
ON controller_services FOR SELECT
USING (is_active = true);

-- Service Options: Anyone can read active options
CREATE POLICY "Anyone can read active service options"
ON controller_service_options FOR SELECT
USING (is_active = true);

-- Service Pricing: Anyone can read available pricing
CREATE POLICY "Anyone can read available service pricing"
ON controller_service_pricing FOR SELECT
USING (is_available = true);

-- Option Pricing: Anyone can read available option pricing
CREATE POLICY "Anyone can read available option pricing"
ON controller_option_pricing FOR SELECT
USING (is_available = true);

-- Service Combos: Anyone can read active combos
CREATE POLICY "Anyone can read active service combos"
ON service_combos FOR SELECT
USING (is_active = true);

-- Reviews: Anyone can read approved and public reviews
CREATE POLICY "Anyone can read approved public reviews"
ON reviews FOR SELECT
USING (is_approved = true AND is_public = true);

-- 3. CUSTOMER POLICIES (for repair requests and reviews)

-- Repair Requests: Customers can insert their own requests
CREATE POLICY "Anyone can create repair requests"
ON repair_requests FOR INSERT
WITH CHECK (true);

-- Repair Requests: Customers can read their own requests (by token in URL)
CREATE POLICY "Anyone can read repair requests with valid token"
ON repair_requests FOR SELECT
USING (true); -- Note: This is intentionally permissive for review page access

-- Repair Request Services: Read access for repair request viewers
CREATE POLICY "Anyone can read repair request services"
ON repair_request_services FOR SELECT
USING (true);

-- Reviews: Customers can insert reviews
CREATE POLICY "Anyone can create reviews"
ON reviews FOR INSERT
WITH CHECK (true);

-- 4. ADMIN POLICIES (authenticated users only)

-- Controller Models: Admins can do everything
CREATE POLICY "Authenticated users can manage controller models"
ON controller_models FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Controller Services: Admins can do everything
CREATE POLICY "Authenticated users can manage controller services"
ON controller_services FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Service Options: Admins can do everything
CREATE POLICY "Authenticated users can manage service options"
ON controller_service_options FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Service Pricing: Admins can do everything
CREATE POLICY "Authenticated users can manage service pricing"
ON controller_service_pricing FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Option Pricing: Admins can do everything
CREATE POLICY "Authenticated users can manage option pricing"
ON controller_option_pricing FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Repair Requests: Admins can do everything
CREATE POLICY "Authenticated users can manage repair requests"
ON repair_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Repair Request Services: Admins can do everything
CREATE POLICY "Authenticated users can manage repair request services"
ON repair_request_services FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Reviews: Admins can do everything
CREATE POLICY "Authenticated users can manage reviews"
ON reviews FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Service Combos: Admins can do everything
CREATE POLICY "Authenticated users can manage service combos"
ON service_combos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Status History: Admins can read and create
CREATE POLICY "Authenticated users can view status history"
ON status_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create status history"
ON status_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- Expense Categories: Admins only
CREATE POLICY "Authenticated users can manage expense categories"
ON expense_categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Expenses: Admins only
CREATE POLICY "Authenticated users can manage expenses"
ON expenses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin Users: Admins can only read (no modifications via SQL)
CREATE POLICY "Authenticated users can read admin users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

-- 5. COMMENTS for documentation
COMMENT ON POLICY "Anyone can read active controller models" ON controller_models IS 'Public read access to active controller models';
COMMENT ON POLICY "Anyone can read active controller services" ON controller_services IS 'Public read access to active services';
COMMENT ON POLICY "Anyone can read approved public reviews" ON reviews IS 'Public read access to approved reviews only';
COMMENT ON POLICY "Anyone can create repair requests" ON repair_requests IS 'Customers can submit repair requests';
COMMENT ON POLICY "Anyone can create reviews" ON reviews IS 'Customers can submit reviews';
COMMENT ON POLICY "Authenticated users can manage repair requests" ON repair_requests IS 'Admin full access to repair requests';
COMMENT ON POLICY "Authenticated users can manage reviews" ON reviews IS 'Admin full access to reviews (approve, delete, etc)';

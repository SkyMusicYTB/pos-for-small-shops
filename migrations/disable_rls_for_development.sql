-- ===============================================
-- DISABLE RLS FOR DEVELOPMENT
-- ===============================================
-- This script temporarily disables Row Level Security
-- for development purposes to fix permission issues
-- 
-- WARNING: Only use this for development!
-- Re-enable RLS for production environments.

-- Disable RLS on all tables temporarily
ALTER TABLE business DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE product DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated role
GRANT ALL ON business TO authenticated;
GRANT ALL ON "user" TO authenticated;
GRANT ALL ON product TO authenticated;
GRANT ALL ON sale TO authenticated;
GRANT ALL ON sale_item TO authenticated;
GRANT ALL ON audit_log TO audit_log;
GRANT ALL ON refresh_token TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Alternative: Create a simpler RLS policy that allows service role access
-- Uncomment these if you prefer to keep RLS enabled but fix the policies:

/*
-- Drop existing policies
DROP POLICY IF EXISTS "super_admin_all_business" ON business;
DROP POLICY IF EXISTS "tenant_business_access" ON business;
DROP POLICY IF EXISTS "super_admin_all_users" ON "user";
DROP POLICY IF EXISTS "tenant_user_access" ON "user";
DROP POLICY IF EXISTS "super_admin_all_products" ON product;
DROP POLICY IF EXISTS "tenant_product_access" ON product;
DROP POLICY IF EXISTS "super_admin_all_sales" ON sale;
DROP POLICY IF EXISTS "tenant_sale_access" ON sale;
DROP POLICY IF EXISTS "super_admin_all_sale_items" ON sale_item;
DROP POLICY IF EXISTS "tenant_sale_item_access" ON sale_item;
DROP POLICY IF EXISTS "super_admin_all_audit_logs" ON audit_log;
DROP POLICY IF EXISTS "tenant_audit_log_access" ON audit_log;
DROP POLICY IF EXISTS "super_admin_all_refresh_tokens" ON refresh_token;
DROP POLICY IF EXISTS "tenant_refresh_token_access" ON refresh_token;

-- Create simple allow-all policies for development
CREATE POLICY "allow_all_business" ON business FOR ALL USING (true);
CREATE POLICY "allow_all_users" ON "user" FOR ALL USING (true);
CREATE POLICY "allow_all_products" ON product FOR ALL USING (true);
CREATE POLICY "allow_all_sales" ON sale FOR ALL USING (true);
CREATE POLICY "allow_all_sale_items" ON sale_item FOR ALL USING (true);
CREATE POLICY "allow_all_audit_logs" ON audit_log FOR ALL USING (true);
CREATE POLICY "allow_all_refresh_tokens" ON refresh_token FOR ALL USING (true);
*/

-- Success message
SELECT 'RLS disabled for development. Your application should now work!' as status;
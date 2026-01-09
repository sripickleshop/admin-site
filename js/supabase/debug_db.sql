-- DEBUG DATABASE SCRIPT
-- ===============================================
-- Run this to diagnose the "Failed to update" error.
-- Look at the output in the "Results" pane.

-- 1. Check if table exists and is visible
SELECT tablename 
FROM pg_tables 
WHERE tablename = 'shop_products';

-- 2. Check Permissions for 'anon' role (Public)
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'shop_products' AND grantee = 'anon';

-- 3. Force Grant All Permissions to Anon (Just in case)
GRANT ALL ON TABLE shop_products TO anon;
GRANT ALL ON TABLE shop_products TO authenticated;
GRANT ALL ON TABLE shop_products TO service_role;

-- 4. Check Table Columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shop_products';

-- 5. Disable RLS again (Verification)
ALTER TABLE shop_products DISABLE ROW LEVEL SECURITY;

-- If you run this and still get an error, the issue is likely:
-- A) The frontend is using the wrong URL/Key.
-- B) A connection blocking extension/firewall.

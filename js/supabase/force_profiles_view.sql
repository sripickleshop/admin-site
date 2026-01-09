-- FORCE VIEW PROFILES SCRIPT
-- ===============================================
-- usage: Run this to Fix "No Customers Found" issue.

-- 1. Disable RLS on profiles table
-- This removes the "4 RLS Policies" blocking your view.
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Explicitly Grant Select to "Public" (anon) role
GRANT SELECT ON TABLE profiles TO anon;
GRANT SELECT ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO service_role;

-- 3. Verify
-- You should see the table name below if it worked.
SELECT count(*) as "Total Profiles" FROM profiles;

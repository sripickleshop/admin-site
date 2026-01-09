-- FIX PROFILES PERMISSION
-- ===============================================
-- Your 'profiles' table has RLS enabled (4 policies).
-- We need to ensure the Admin Dashboard can READ this table.

-- 1. Grant Read Access to Anonymous (Frontend/Admin)
-- This allows your dashboard to "Select *" from profiles.
DROP POLICY IF EXISTS "Admin Read Profiles" ON profiles;
CREATE POLICY "Admin Read Profiles" ON profiles FOR SELECT USING (true);

-- 2. (Optional) Grant Update if you want to edit profiles later
DROP POLICY IF EXISTS "Admin Update Profiles" ON profiles;
CREATE POLICY "Admin Update Profiles" ON profiles FOR UPDATE USING (true);

-- 3. Verify Grants (Schema level)
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO service_role;

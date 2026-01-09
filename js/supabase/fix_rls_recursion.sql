-- FIX INFINITE RECURSION IN RLS POLICY
-- ======================================
-- The current policy on `admin_profiles` is causing a loop (infinite recursion).
-- This blocks ALL queries to this table, including Sign Up triggers.

-- 1. Drop the problematic policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "admin_profiles";
DROP POLICY IF EXISTS "Allow read access for all users" ON "admin_profiles";
DROP POLICY IF EXISTS "Public can view profiles" ON "admin_profiles";

-- 2. Create a SAFE, simple policy
-- This allows anyone to READ the profiles (needed for login checks).
CREATE POLICY "Enable read access for all users" ON "admin_profiles"
FOR SELECT USING (true);

-- 3. Allow Service Role to do everything (always good to ensure)
-- (Service role bypasses RLS anyway, but explicit policies help clarity)

-- FIX ADMIN ROLE CONSTRAINT
-- ===========================
-- The error "violates check constraint 'admin_profiles_role_check'" means the role 'developer' 
-- is not in the allowed list of the existing table definition.

-- 1. Drop the old restrictive constraint
ALTER TABLE admin_profiles 
DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

-- 2. Add a new, more flexible constraint (or just leave it open if preferred)
-- We include 'developer', 'manager', 'staff', 'master', 'admin' to cover all bases.
ALTER TABLE admin_profiles 
ADD CONSTRAINT admin_profiles_role_check 
CHECK (role IN ('developer', 'manager', 'staff', 'master', 'admin'));

-- 3. (Optional) Ensure the columns exist just in case
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

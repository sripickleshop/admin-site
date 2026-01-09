-- USER PROFILES SETUP (CRM)
-- ===============================================
-- This script enables you to see ALL users who sign up, 
-- not just the ones who place orders.

-- 1. Create Public Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS (Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Open Access for Admin/Public (Adjust for production later)
-- Allow Admins to View All
DROP POLICY IF EXISTS "Start Open" ON user_profiles;
CREATE POLICY "Start Open" ON user_profiles FOR ALL USING (true);


-- 4. AUTO-SYNC TRIGGER (The Magic Part)
-- Automatically creates a profile when a user signs up via Auth.

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 5. Backfill Existing Users (Optional but recommended)
-- If you have users who signed up BEFORE running this script,
-- this command copies them into the new table. (Requires elevated privs)
INSERT INTO public.user_profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

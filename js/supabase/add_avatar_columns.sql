-- ADD AVATAR SUPPORT
-- ===============================================

-- 1. Add avatar_url to Customer Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add avatar_url to Admin Profiles
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. (Optional) Auto-Sync from Auth Metadata (e.g. Google Sign In)
-- If usage metadata contains 'avatar_url', copy it to profiles.
UPDATE profiles
SET avatar_url = auth.users.raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.avatar_url IS NULL;

-- 4. Reload Schema Cache
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile picture';

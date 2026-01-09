-- SYNC GOOGLE AVATARS & DATA
-- ===============================================

-- 1. Create Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    -- Only update avatar if it's missing in profiles or if we want to force sync
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger on auth.users
-- Drop first to avoid duplicates if re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill Existing Google Users (One-time fix)
-- Update existing manual profiles if they have Google metadata
UPDATE public.profiles
SET avatar_url = auth.users.raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND public.profiles.avatar_url IS NULL
AND auth.users.raw_user_meta_data->>'avatar_url' IS NOT NULL;

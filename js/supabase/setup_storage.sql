-- ENABLE STORAGE FOR AVATARS
-- ===============================================

-- 1. Create 'avatars' bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS
-- (Buckets usually have RLS by default, but we ensure policies exist)

-- POLICY: Give public access to view images
DROP POLICY IF EXISTS "Public Profile Avatars" ON storage.objects;
CREATE POLICY "Public Profile Avatars" ON storage.objects
  FOR SELECT USING ( bucket_id = 'avatars' );

-- POLICY: Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "User Upload Avatar" ON storage.objects;
CREATE POLICY "User Upload Avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- POLICY: Allow authenticated users to update their own avatar
DROP POLICY IF EXISTS "User Update Avatar" ON storage.objects;
CREATE POLICY "User Update Avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

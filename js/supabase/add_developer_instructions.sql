-- INSTRUCTIONS TO ADD A DEVELOPER / MASTER ADMIN
-- 1. Go to your App's Sign Up page (or use Authentication -> Users in Supabase Dashboard) to create a new user with email/password.
-- 2. Copy the `User UID` from the Authentication tab.
-- 3. Run the following SQL in the SQL Editor, replacing 'PASTE_USER_UUID_HERE':

INSERT INTO admin_profiles (id, email, role, full_name, is_active, permissions)
VALUES (
  'eade3102-eae2-4ec7-8158-d26a380da2b4', 
  'developer@sripickles.com', -- email used in step 1
  'developer', 
  'Master Developer', 
  true, 
  '{"products": true, "orders": true, "customers": true, "settings": true, "team": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET role = 'developer', permissions = '{"products": true, "orders": true, "customers": true, "settings": true, "team": true}'::jsonb;

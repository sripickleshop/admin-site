-- PAYMENT PROOFS & ADMIN ROLES
-- ============================

-- 1. Add Payment Proof Column to Orders
ALTER TABLE shop_orders 
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- 2. Enhance Admin Profiles for Team Management
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff', -- 'developer', 'manager', 'staff'
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb; -- { "products": true, "orders": false }

-- 3. Create Storage for Order Proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('order_proofs', 'order_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Policies for Order Proofs
-- Allow simple public view (for Admin Dashboard)
CREATE POLICY "Public can view proofs" ON storage.objects
  FOR SELECT USING ( bucket_id = 'order_proofs' );

-- Allow Guest/Auth uploads
CREATE POLICY "Anyone can upload proofs" ON storage.objects
  FOR INSERT WITH CHECK ( bucket_id = 'order_proofs' );

-- 5. Insert Developer User (Placeholder - USER MUST EDIT EMAIL)
-- We cannot insert into auth.users easily via SQL script without ID.
-- Instead, we assume the user will sign up simply, and we update their role manually or via script.
-- This script prepares the table.

-- 6. Grant Permissions
GRANT ALL ON admin_profiles TO authenticated;
GRANT ALL ON admin_profiles TO service_role;

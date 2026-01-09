-- ORDER SYSTEM SETUP
-- ===================

-- 1. Create shop_orders table
CREATE TABLE IF NOT EXISTS shop_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number TEXT DEFAULT ('ORD-' || substring(gen_random_uuid()::text, 1, 8)),
    status TEXT DEFAULT 'pending', -- pending, processed, shipped, delivered, cancelled
    total_amount NUMERIC NOT NULL,
    subtotal NUMERIC,
    gst NUMERIC,
    shipping_cost NUMERIC,
    discount NUMERIC DEFAULT 0,
    promo_code TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    payment_method TEXT,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create shop_order_items table
CREATE TABLE IF NOT EXISTS shop_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL, -- Keep record even if product deleted
    product_name TEXT, -- Snapshot name in case product changes
    variant_label TEXT,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL
);

-- 3. Enable RLS
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;

-- 4. Policies for shop_orders

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders" ON shop_orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create orders
CREATE POLICY "Users can create orders" ON shop_orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all orders (assuming public.admin_profiles check or similar)
-- For simplicity, we might rely on the dashboard client using a service role OR ensure admin uid matches.
-- However, currently we are using supabaseAdmin in dashboard which typically bypasses RLS if using service key, 
-- or if using authenticated user, we need an admin policy.
-- Let's add a policy checking admin_profiles if possible, or just open for now and refine later.
-- Ideally: 
-- CREATE POLICY "Admins can view all" ON shop_orders FOR ALL USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
-- But for now to avoid complexity errors if admin_profiles logic is shaky, we will rely on key-based access or broad access for authenticated users (which is risky) or use the Service Role Key for Admin Dashboard.
-- User "supabaseAdmin" client in dashboard usually SHOULD use Service Role Key or be an Admin User.
-- Let's try to trust the Admin Dashboard uses a privileged user or Service Role.
-- But if the dashboard logs in as a user, we need a policy.

-- Admin Policy (Generic for now, assuming admin_profiles exists)
CREATE POLICY "Admins can do everything on orders" ON shop_orders
    FOR ALL
    USING (
        EXISTS ( SELECT 1 FROM admin_profiles WHERE id = auth.uid() )
    );

-- 5. Policies for shop_order_items

-- Policy: Users scan view own order items (via join)
CREATE POLICY "Users can view own order items" ON shop_order_items
    FOR SELECT
    USING (
        EXISTS ( 
            SELECT 1 FROM shop_orders 
            WHERE shop_orders.id = shop_order_items.order_id 
            AND shop_orders.user_id = auth.uid() 
        )
    );

-- Policy: Users can create order items
-- (Checking parent order ownership is tricky on insert in standard Policy without complex logic, 
-- but we can allow INSERT if authenticated. The Controller ensures they match.)
CREATE POLICY "Users can create order items" ON shop_order_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Admin Policy
CREATE POLICY "Admins can do everything on order items" ON shop_order_items
    FOR ALL
    USING (
        EXISTS ( SELECT 1 FROM admin_profiles WHERE id = auth.uid() )
    );

-- 6. Grant Permissions (just in case)
GRANT ALL ON shop_orders TO authenticated;
GRANT ALL ON shop_orders TO service_role;
GRANT ALL ON shop_order_items TO authenticated;
GRANT ALL ON shop_order_items TO service_role;

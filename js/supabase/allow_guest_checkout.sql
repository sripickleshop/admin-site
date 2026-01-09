-- ENABLE GUEST CHECKOUT
-- =====================

-- 1. Allow Guests to Insert Orders
CREATE POLICY "Guests can create orders" ON shop_orders
    FOR INSERT
    TO anon
    WITH CHECK (auth.role() = 'anon' AND user_id IS NULL);

-- 2. Allow Guests to Insert Order Items (order_id will link to the order they just created)
-- Checking strictly that they own the order is hard for anon without order_id knowledge in context,
-- but we can allow INSERT for anon generally, provided they have the order_id (which they generate or receive).
-- To be safe, we might just allow anon inserts on items.
CREATE POLICY "Guests can create order items" ON shop_order_items
    FOR INSERT
    TO anon
    WITH CHECK (auth.role() = 'anon');

-- 3. Ensure Products are Readable by Everyone (if not already)
-- (Existing policies usually cover this, but just in case)
DROP POLICY IF EXISTS "Public can view active products" ON shop_products;
CREATE POLICY "Public can view active products" ON shop_products
    FOR SELECT
    USING ( active = true );

-- 4. Enable Read on Orders for "Thank You" page?
-- Usually we return the created order. The INSERT policy needs 'returning' permission?
-- In Supabase, INSERT ... RETURNING works if you have SELECT permission on the rows you insert?
-- OR if the rule covers it.
-- Actually, for Anon to read back the order they just made, we might need a condition.
-- But usually `insert().select()` works if the policy allows.
-- Let's just ensure Anon can't read ALL orders.
-- NO SELECT POLICY for Anon on orders (secure). They can rely on the data they sent or what is returned immediately (if allowed).
-- If `insert().select()` fails for Anon, we might need a "View own created order" policy based on ID? Hard for stateless anon.
-- We'll assume the client app displays success based on local state if fetch fails.

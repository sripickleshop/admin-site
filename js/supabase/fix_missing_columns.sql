-- FIX MISSING COLUMNS SCRIPT
-- ===================================================
-- The error "Could not find 'stock_quantity' column" means this column is missing in your database.
-- This script adds the missing columns safely.

-- 1. Add 'stock_quantity' if it doesn't exist
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 2. Add 'active' column if it doesn't exist
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 3. Reload Schema Cache (Force PostgREST to see changes)
-- Applying a comment triggers a schema cache reload in Supabase.
COMMENT ON COLUMN shop_products.stock_quantity IS 'Available inventory count';

-- 4. Verify Columns
-- This will list columns so you can be sure.
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shop_products';

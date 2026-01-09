-- ADD VARIANTS SUPPORT
-- ===============================================

-- 1. Add jsonb column for variants
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 2. Comment on column for clarity
COMMENT ON COLUMN shop_products.variants IS 'Array of variants: [{ "name": "250g", "price": 100, "stock": 50 }, ...]';

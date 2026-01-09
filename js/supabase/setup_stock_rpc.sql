-- STOCK MANAGEMENT RPC (FIXED COLUMN NAME)
-- =======================================
-- Used to securely decrement stock from the client side.

CREATE OR REPLACE FUNCTION deduct_stock(
  p_product_id UUID, 
  p_quantity INT, 
  p_variant_label TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product RECORD;
  v_variants JSONB;
  v_new_variants JSONB;
  v_item JSONB;
  v_idx INT;
  v_current_stock INT;
BEGIN
  -- 1. Get Product
  SELECT * INTO v_product FROM shop_products WHERE id = p_product_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- 2. Check if it has variants
  IF v_product.variants IS NULL OR jsonb_array_length(v_product.variants) = 0 THEN
    -- SIMPLE PRODUCT (Column: stock_quantity)
    UPDATE shop_products 
    SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
    WHERE id = p_product_id;
  
  ELSE
    -- VARIANT PRODUCT
    v_variants := v_product.variants;
    v_new_variants := '[]'::jsonb;
    
    -- Iterate through variants to find the match
    FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
      v_item := v_variants->i;
      
      -- Flexible matching
      IF (v_item->>'label' = p_variant_label) OR (v_item->>'name' = p_variant_label) THEN
         -- Found match, decrement stock inside JSON
         v_current_stock := (v_item->>'stock')::INT;
         v_current_stock := GREATEST(0, v_current_stock - p_quantity);
         v_item := jsonb_set(v_item, '{stock}', to_jsonb(v_current_stock));
      END IF;
      
      -- Append to new array
      v_new_variants := v_new_variants || v_item;
    END LOOP;

    -- Update the product with new variants array AND update total stock_quantity
    UPDATE shop_products 
    SET variants = v_new_variants,
        stock_quantity = (SELECT SUM((elem->>'stock')::INT) FROM jsonb_array_elements(v_new_variants) elem)
    WHERE id = p_product_id;

  END IF;
END;
$$;

-- Fix 1: Remove the overly permissive guest orders policy
DROP POLICY IF EXISTS "Guests can view own orders via function" ON public.orders;

-- Fix 2: Ensure order price validation triggers exist
-- Check if trigger already exists, recreate for safety
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT COALESCE(discount_price, price)
  INTO NEW.unit_price
  FROM products WHERE id = NEW.product_id;
  
  IF NEW.unit_price IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_item_price ON order_items;
CREATE TRIGGER set_order_item_price
  BEFORE INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION enforce_order_item_price();

-- Trigger to recalculate order total from items
CREATE OR REPLACE FUNCTION public.recalculate_order_total_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calculated_total numeric;
BEGIN
  SELECT COALESCE(SUM(unit_price * quantity), 0)
  INTO calculated_total
  FROM order_items WHERE order_id = NEW.order_id;
  
  UPDATE orders SET total_amount = calculated_total WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recalculate_order_total ON order_items;
CREATE TRIGGER recalculate_order_total
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_order_total_trigger();
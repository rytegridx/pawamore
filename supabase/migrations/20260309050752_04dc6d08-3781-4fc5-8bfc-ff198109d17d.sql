-- Fix: Allow order items to be inserted for guest orders too
DROP POLICY IF EXISTS "Users create own order items" ON public.order_items;

CREATE POLICY "Users and guests create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (
      orders.user_id = auth.uid()
      OR (orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
    )
  )
);
-- ============================================
-- AI Revenue Recovery - Remove demo/old orders
-- ============================================
-- Removes all existing orders and order_items.
-- The orders and order_items tables are preserved.
-- RLS policies remain unchanged.
-- After running, the Orders page will start empty.
-- New orders will only be created via the checkout flow.
-- ============================================

DELETE FROM public.order_items;
DELETE FROM public.orders;

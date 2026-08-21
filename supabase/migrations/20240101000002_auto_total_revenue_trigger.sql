-- Auto-update customer total revenue when invoices change
-- Only invoices with status = 'paid' count toward total_revenue.
-- Trigger is scoped by customer_id and user_id so one user's data cannot affect another user's customer revenue.
-- Handles customer_id changes during UPDATE by recalculating both old and new customer totals.

CREATE OR REPLACE FUNCTION public.update_customer_total_revenue()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_new_total NUMERIC;
BEGIN
  -- Recalculate for the new/current customer
  IF TG_OP != 'DELETE' AND NEW.customer_id IS NOT NULL THEN
    SELECT user_id INTO v_user_id FROM public.customers WHERE id = NEW.customer_id;
    IF v_user_id IS NOT NULL THEN
      SELECT COALESCE(SUM(amount), 0) INTO v_new_total
      FROM public.invoices
      WHERE customer_id = NEW.customer_id
        AND user_id = v_user_id
        AND status = 'paid';

      UPDATE public.customers
      SET total_revenue = v_new_total
      WHERE id = NEW.customer_id
        AND user_id = v_user_id;
    END IF;
  END IF;

  -- Recalculate for the old customer if customer_id changed during UPDATE
  IF TG_OP != 'INSERT'
     AND OLD.customer_id IS NOT NULL
     AND OLD.customer_id IS DISTINCT FROM NEW.customer_id
  THEN
    SELECT user_id INTO v_user_id FROM public.customers WHERE id = OLD.customer_id;
    IF v_user_id IS NOT NULL THEN
      SELECT COALESCE(SUM(amount), 0) INTO v_new_total
      FROM public.invoices
      WHERE customer_id = OLD.customer_id
        AND user_id = v_user_id
        AND status = 'paid';

      UPDATE public.customers
      SET total_revenue = v_new_total
      WHERE id = OLD.customer_id
        AND user_id = v_user_id;
    END IF;
  END IF;

  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_update_customer_total_revenue ON public.invoices;
CREATE TRIGGER trg_update_customer_total_revenue
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_total_revenue();

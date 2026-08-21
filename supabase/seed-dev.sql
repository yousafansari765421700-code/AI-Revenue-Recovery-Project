-- ============================================
-- DEVELOPMENT ONLY: Seed data for AI Revenue Recovery
-- ============================================
-- WARNING: This script creates test data.
-- Run only in development environments.
-- Do NOT run in production.
--
-- How to use:
-- 1. Log in to the application as a test user.
-- 2. Open Supabase Dashboard > SQL Editor.
-- 3. Paste this script and run it.
-- 4. auth.uid() will be used automatically if a session exists.
--    If auth.uid() is null, replace :test_user_id with your actual user UUID.
-- ============================================

-- ============================================
-- CONFIGURATION
-- ============================================
-- If auth.uid() returns null in the SQL Editor, replace the value below
-- with your actual user ID from Supabase > Authentication > Users.
DO $$
DECLARE
  v_user_id UUID := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID);
BEGIN
  IF v_user_id = '00000000-0000-0000-0000-000000000000'::UUID THEN
    RAISE EXCEPTION 'auth.uid() is null. Replace the placeholder UUID in this script with your actual user ID.';
  END IF;

  -- ============================================
  -- 1. CREATE CUSTOMERS (3 customers)
  -- ============================================
  -- Customer 1: Acme Corp
  INSERT INTO public.customers (id, user_id, name, email, company, total_revenue, status, created_at, updated_at)
  VALUES (
    uuid_generate_v4(),
    v_user_id,
    'John Smith',
    'john@acmecorp.com',
    'Acme Corp',
    0,
    'active',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Customer 2: Globex Inc
  INSERT INTO public.customers (id, user_id, name, email, company, total_revenue, status, created_at, updated_at)
  VALUES (
    uuid_generate_v4(),
    v_user_id,
    'Sarah Johnson',
    'sarah@globex.com',
    'Globex Inc',
    0,
    'active',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Customer 3: Initech
  INSERT INTO public.customers (id, user_id, name, email, company, total_revenue, status, created_at, updated_at)
  VALUES (
    uuid_generate_v4(),
    v_user_id,
    'Mike Bolton',
    'mike@initech.com',
    'Initech',
    0,
    'active',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 2. CREATE INVOICES
  -- ============================================
  -- We need customer IDs. Since we used uuid_generate_v4(), we need to fetch them.
  -- We'll use a temporary table approach or fetch by email/user_id combination.

  -- For simplicity, we'll create invoices using customer_id from a subquery.
  -- We need to get the customer IDs first.

  -- Acme Corp invoices
  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-001',
    5000.00,
    'USD',
    'paid',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '20 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'john@acmecorp.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-002',
    3000.00,
    'USD',
    'paid',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '10 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'john@acmecorp.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-003',
    7500.00,
    'USD',
    'failed',
    NOW() - INTERVAL '5 days',
    NULL,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'john@acmecorp.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  -- Globex Inc invoices
  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-004',
    4200.00,
    'USD',
    'paid',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '12 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'sarah@globex.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-005',
    6100.00,
    'USD',
    'overdue',
    NOW() - INTERVAL '3 days',
    NULL,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'sarah@globex.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  -- Initech invoices
  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-006',
    8500.00,
    'USD',
    'failed',
    NOW() - INTERVAL '7 days',
    NULL,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'mike@initech.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  INSERT INTO public.invoices (id, user_id, customer_id, invoice_number, amount, currency, status, due_date, paid_at, created_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    c.id,
    'INV-007',
    1200.00,
    'USD',
    'pending',
    NOW() + INTERVAL '10 days',
    NULL,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  FROM public.customers c
  WHERE c.user_id = v_user_id AND c.email = 'mike@initech.com'
  ON CONFLICT (user_id, invoice_number) DO NOTHING;

  -- ============================================
  -- 3. CREATE FAILED PAYMENTS (linked to failed invoices)
  -- ============================================
  -- Failed payment 1: Acme Corp INV-003 (card declined)
  INSERT INTO public.failed_payments (id, user_id, customer_id, invoice_id, amount, failure_reason, recovery_status, detected_at, recovered_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    i.customer_id,
    i.id,
    i.amount,
    'Card declined - insufficient funds',
    'pending',
    NOW() - INTERVAL '5 days',
    NULL,
    NOW()
  FROM public.invoices i
  WHERE i.user_id = v_user_id AND i.invoice_number = 'INV-003'
  ON CONFLICT (id) DO NOTHING;

  -- Failed payment 2: Initech INV-006 (expired card)
  INSERT INTO public.failed_payments (id, user_id, customer_id, invoice_id, amount, failure_reason, recovery_status, detected_at, recovered_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    i.customer_id,
    i.id,
    i.amount,
    'Card expired',
    'pending',
    NOW() - INTERVAL '7 days',
    NULL,
    NOW()
  FROM public.invoices i
  WHERE i.user_id = v_user_id AND i.invoice_number = 'INV-006'
  ON CONFLICT (id) DO NOTHING;

  -- Failed payment 3: Acme Corp INV-003 (in_progress - already being recovered)
  -- This represents a second recovery attempt for the same invoice
  INSERT INTO public.failed_payments (id, user_id, customer_id, invoice_id, amount, failure_reason, recovery_status, detected_at, recovered_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    i.customer_id,
    i.id,
    i.amount * 0.5,
    'Partial payment failed',
    'in_progress',
    NOW() - INTERVAL '2 days',
    NULL,
    NOW()
  FROM public.invoices i
  WHERE i.user_id = v_user_id AND i.invoice_number = 'INV-003'
  ON CONFLICT (id) DO NOTHING;

  -- Failed payment 4: Globex Inc INV-005 (overdue - treated as failed)
  INSERT INTO public.failed_payments (id, user_id, customer_id, invoice_id, amount, failure_reason, recovery_status, detected_at, recovered_at, updated_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    i.customer_id,
    i.id,
    i.amount,
    'Invoice overdue - no payment received',
    'pending',
    NOW() - INTERVAL '3 days',
    NULL,
    NOW()
  FROM public.invoices i
  WHERE i.user_id = v_user_id AND i.invoice_number = 'INV-005'
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 4. CREATE RECOVERY CAMPAIGNS
  -- ============================================
  INSERT INTO public.recovery_campaigns (id, user_id, name, description, status, recovered_amount, created_at, updated_at)
  VALUES (
    uuid_generate_v4(),
    v_user_id,
    'Q4 Payment Recovery',
    'Automated recovery campaign for Q4 failed payments',
    'active',
    0,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 days'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.recovery_campaigns (id, user_id, name, description, status, recovered_amount, created_at, updated_at)
  VALUES (
    uuid_generate_v4(),
    v_user_id,
    'High Value Follow-up',
    'Personal outreach for high-value failed payments',
    'draft',
    0,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 5. CREATE RECOVERY ACTIONS
  -- ============================================
  -- Recovery action for the in_progress failed payment
  INSERT INTO public.recovery_actions (id, user_id, failed_payment_id, campaign_id, action_type, status, executed_at, created_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    fp.id,
    rc.id,
    'email',
    'pending',
    NULL,
    NOW() - INTERVAL '2 days'
  FROM public.failed_payments fp
  CROSS JOIN public.recovery_campaigns rc
  WHERE fp.user_id = v_user_id
    AND fp.recovery_status = 'in_progress'
    AND fp.failure_reason = 'Partial payment failed'
    AND rc.user_id = v_user_id
    AND rc.name = 'Q4 Payment Recovery'
  LIMIT 1
  ON CONFLICT (id) DO NOTHING;

  -- Recovery action for a pending failed payment
  INSERT INTO public.recovery_actions (id, user_id, failed_payment_id, campaign_id, action_type, status, executed_at, created_at)
  SELECT
    uuid_generate_v4(),
    v_user_id,
    fp.id,
    rc.id,
    'email',
    'pending',
    NULL,
    NOW() - INTERVAL '1 day'
  FROM public.failed_payments fp
  CROSS JOIN public.recovery_campaigns rc
  WHERE fp.user_id = v_user_id
    AND fp.recovery_status = 'pending'
    AND fp.failure_reason = 'Card declined - insufficient funds'
    AND rc.user_id = v_user_id
    AND rc.name = 'Q4 Payment Recovery'
  LIMIT 1
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 6. CREATE REVENUE METRICS (last 30 days)
  -- ============================================
  FOR i IN 0..29 LOOP
    INSERT INTO public.revenue_metrics (id, user_id, date, total_revenue, recovered_revenue, lost_revenue, failed_payment_amount, created_at)
    VALUES (
      uuid_generate_v4(),
      v_user_id,
      (NOW() - (i || ' days')::INTERVAL)::DATE,
      COALESCE(
        (SELECT SUM(amount) FROM public.invoices WHERE user_id = v_user_id AND status = 'paid' AND created_at::DATE = (NOW() - (i || ' days')::INTERVAL)::DATE),
        0
      ),
      COALESCE(
        (SELECT SUM(amount) FROM public.failed_payments WHERE user_id = v_user_id AND recovery_status = 'recovered' AND detected_at::DATE = (NOW() - (i || ' days')::INTERVAL)::DATE),
        0
      ),
      COALESCE(
        (SELECT SUM(amount) FROM public.invoices WHERE user_id = v_user_id AND status IN ('failed', 'overdue') AND created_at::DATE = (NOW() - (i || ' days')::INTERVAL)::DATE),
        0
      ),
      COALESCE(
        (SELECT SUM(amount) FROM public.failed_payments WHERE user_id = v_user_id AND detected_at::DATE = (NOW() - (i || ' days')::INTERVAL)::DATE),
        0
      ),
      NOW() - (i || ' days')::INTERVAL
    )
    ON CONFLICT (user_id, date) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Test data created successfully for user: %', v_user_id;
END $$;

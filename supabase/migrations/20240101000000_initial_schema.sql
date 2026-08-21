-- ============================================
-- AI Revenue Recovery - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  business_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  total_revenue NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'churned')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
CREATE POLICY "Users can view own customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
CREATE POLICY "Users can insert own customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
CREATE POLICY "Users can update own customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;
CREATE POLICY "Users can delete own customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 3. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'failed')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
CREATE POLICY "Users can update own invoices"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can delete own invoices"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. FAILED_PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.failed_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  failure_reason TEXT,
  recovery_status TEXT DEFAULT 'pending' CHECK (recovery_status IN ('pending', 'in_progress', 'recovered', 'failed')),
  detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  recovered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_failed_payments_user_id ON public.failed_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_customer_id ON public.failed_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_invoice_id ON public.failed_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_recovery_status ON public.failed_payments(recovery_status);
CREATE INDEX IF NOT EXISTS idx_failed_payments_detected_at ON public.failed_payments(detected_at);

ALTER TABLE public.failed_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own failed payments" ON public.failed_payments;
CREATE POLICY "Users can view own failed payments"
  ON public.failed_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own failed payments" ON public.failed_payments;
CREATE POLICY "Users can insert own failed payments"
  ON public.failed_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own failed payments" ON public.failed_payments;
CREATE POLICY "Users can update own failed payments"
  ON public.failed_payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own failed payments" ON public.failed_payments;
CREATE POLICY "Users can delete own failed payments"
  ON public.failed_payments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. RECOVERY_CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recovery_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  recovered_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recovery_campaigns_user_id ON public.recovery_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_campaigns_status ON public.recovery_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_recovery_campaigns_created_at ON public.recovery_campaigns(created_at);

ALTER TABLE public.recovery_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaigns" ON public.recovery_campaigns;
CREATE POLICY "Users can view own campaigns"
  ON public.recovery_campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.recovery_campaigns;
CREATE POLICY "Users can insert own campaigns"
  ON public.recovery_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON public.recovery_campaigns;
CREATE POLICY "Users can update own campaigns"
  ON public.recovery_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.recovery_campaigns;
CREATE POLICY "Users can delete own campaigns"
  ON public.recovery_campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. RECOVERY_ACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recovery_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  failed_payment_id UUID REFERENCES public.failed_payments ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.recovery_campaigns ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('email', 'sms', 'call', 'retry_payment', 'offer_discount')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recovery_actions_user_id ON public.recovery_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_actions_failed_payment_id ON public.recovery_actions(failed_payment_id);
CREATE INDEX IF NOT EXISTS idx_recovery_actions_campaign_id ON public.recovery_actions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recovery_actions_status ON public.recovery_actions(status);

ALTER TABLE public.recovery_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recovery actions" ON public.recovery_actions;
CREATE POLICY "Users can view own recovery actions"
  ON public.recovery_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recovery actions" ON public.recovery_actions;
CREATE POLICY "Users can insert own recovery actions"
  ON public.recovery_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recovery actions" ON public.recovery_actions;
CREATE POLICY "Users can update own recovery actions"
  ON public.recovery_actions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recovery actions" ON public.recovery_actions;
CREATE POLICY "Users can delete own recovery actions"
  ON public.recovery_actions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 7. REVENUE_METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.revenue_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  recovered_revenue NUMERIC DEFAULT 0,
  lost_revenue NUMERIC DEFAULT 0,
  failed_payment_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_revenue_metrics_user_id ON public.revenue_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_date ON public.revenue_metrics(date);

ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own revenue metrics" ON public.revenue_metrics;
CREATE POLICY "Users can view own revenue metrics"
  ON public.revenue_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own revenue metrics" ON public.revenue_metrics;
CREATE POLICY "Users can insert own revenue metrics"
  ON public.revenue_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own revenue metrics" ON public.revenue_metrics;
CREATE POLICY "Users can update own revenue metrics"
  ON public.revenue_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own revenue metrics" ON public.revenue_metrics;
CREATE POLICY "Users can delete own revenue metrics"
  ON public.revenue_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recovery_campaigns_updated_at ON public.recovery_campaigns;
CREATE TRIGGER update_recovery_campaigns_updated_at BEFORE UPDATE ON public.recovery_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_failed_payments_updated_at ON public.failed_payments;
CREATE TRIGGER update_failed_payments_updated_at BEFORE UPDATE ON public.failed_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

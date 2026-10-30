-- ============================================
-- AI Revenue Recovery - Stores (per-user storefront) Migration
-- ============================================
-- Self-contained: enables required extensions, creates function if missing,
-- then creates the stores table with RLS and trigger.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function used by updated_at triggers (idempotent).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stores table: one store per authenticated user.
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own store" ON public.stores;
CREATE POLICY "Users can view own store"
  ON public.stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own store" ON public.stores;
CREATE POLICY "Users can insert own store"
  ON public.stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own store" ON public.stores;
CREATE POLICY "Users can update own store"
  ON public.stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own store" ON public.stores;
CREATE POLICY "Users can delete own store"
  ON public.stores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

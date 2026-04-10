-- Idempotent safety migration for scraper schema.
-- Tables already exist in earlier migrations on this branch; this ensures
-- environments that missed those migrations still converge safely.

-- scraper_runs
CREATE TABLE IF NOT EXISTS public.scraper_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  error_message TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scraper_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scraper_runs'
      AND policyname = 'Admins can manage scraper runs'
  ) THEN
    CREATE POLICY "Admins can manage scraper runs"
      ON public.scraper_runs FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_scraper_runs_updated_at ON public.scraper_runs;
CREATE TRIGGER update_scraper_runs_updated_at
  BEFORE UPDATE ON public.scraper_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_scraper_runs_status
  ON public.scraper_runs (status, created_at);

-- product_import_logs
CREATE TABLE IF NOT EXISTS public.product_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  imported_by UUID,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  original_data JSONB,
  processed_data JSONB,
  ai_response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_import_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_import_logs'
      AND policyname = 'Admins can manage import logs'
  ) THEN
    CREATE POLICY "Admins can manage import logs"
      ON public.product_import_logs FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_product_import_logs_updated_at ON public.product_import_logs;
CREATE TRIGGER update_product_import_logs_updated_at
  BEFORE UPDATE ON public.product_import_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- products source columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT;

-- Transitional unique index (next migration replaces this with unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_url
  ON public.products(source_url)
  WHERE source_url IS NOT NULL;

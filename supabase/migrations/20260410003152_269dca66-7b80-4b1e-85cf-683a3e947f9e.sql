
-- Create scraper_runs table for the ScraperManager UI
CREATE TABLE public.scraper_runs (
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

CREATE POLICY "Admins can manage scraper runs"
  ON public.scraper_runs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_scraper_runs_updated_at
  BEFORE UPDATE ON public.scraper_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create product_import_logs table for the ProductImportModal
CREATE TABLE public.product_import_logs (
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

CREATE POLICY "Admins can manage import logs"
  ON public.product_import_logs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_import_logs_updated_at
  BEFORE UPDATE ON public.product_import_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT;

-- Add unique constraint on source_url for upsert support (nullable, so only non-null values are unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_url ON public.products(source_url) WHERE source_url IS NOT NULL;

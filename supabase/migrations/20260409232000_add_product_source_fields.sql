-- Preserve upstream catalog metadata for AI-imported products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS source_metadata JSONB;

-- Prevent duplicate imports of the same upstream page
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_url_unique
  ON public.products (source_url)
  WHERE source_url IS NOT NULL;

COMMENT ON COLUMN public.products.source_url IS
  'Canonical upstream URL used during automated product import';

COMMENT ON COLUMN public.products.product_type IS
  'Normalized source product type (e.g. all-in-one, inverter, panel, battery)';

COMMENT ON COLUMN public.products.source_metadata IS
  'Additional unmapped source fields captured during scraping';

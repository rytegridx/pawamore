
-- Drop partial index and add proper unique constraint
DROP INDEX IF EXISTS idx_products_source_url;
DROP INDEX IF EXISTS idx_products_source_url_unique;
ALTER TABLE public.products ADD CONSTRAINT products_source_url_key UNIQUE (source_url);

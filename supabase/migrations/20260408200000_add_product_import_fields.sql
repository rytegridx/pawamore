-- Add fields to products table to support AI product import
-- These fields store AI-generated SEO metadata and allow direct category/brand strings

-- Add category field (string for imported products, separate from category_id FK)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add brand field (string for imported products, separate from brand_id FK)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add meta_description for SEO
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add meta_keywords for SEO
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.products.category IS 'Category name string (used by AI import, separate from category_id FK)';
COMMENT ON COLUMN public.products.brand IS 'Brand name string (used by AI import, separate from brand_id FK)';
COMMENT ON COLUMN public.products.meta_description IS 'SEO meta description for product page';
COMMENT ON COLUMN public.products.meta_keywords IS 'SEO keywords for product page';

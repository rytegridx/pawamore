-- Create product_import_logs table for tracking AI scraping
CREATE TABLE IF NOT EXISTS public.product_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  original_data JSONB,
  processed_data JSONB,
  ai_response JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_product_import_logs_status ON public.product_import_logs(status);
CREATE INDEX IF NOT EXISTS idx_product_import_logs_imported_by ON public.product_import_logs(imported_by);
CREATE INDEX IF NOT EXISTS idx_product_import_logs_created_at ON public.product_import_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.product_import_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view import logs
CREATE POLICY "Admins can view all import logs"
  ON public.product_import_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can insert import logs
CREATE POLICY "Admins can insert import logs"
  ON public.product_import_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update import logs
CREATE POLICY "Admins can update import logs"
  ON public.product_import_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.product_import_logs IS 'Tracks AI-powered product imports from external URLs';
COMMENT ON COLUMN public.product_import_logs.source_url IS 'Original product URL that was scraped';
COMMENT ON COLUMN public.product_import_logs.status IS 'Import status: pending, success, or failed';
COMMENT ON COLUMN public.product_import_logs.original_data IS 'Raw scraped data from the source website';
COMMENT ON COLUMN public.product_import_logs.processed_data IS 'AI-processed and localized product data';
COMMENT ON COLUMN public.product_import_logs.ai_response IS 'Full response from AI rewriting service';
COMMENT ON COLUMN public.product_import_logs.error_message IS 'Error details if import failed';

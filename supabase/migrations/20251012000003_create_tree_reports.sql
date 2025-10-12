-- Create tree_reports table for users to report issues with trees
CREATE TABLE IF NOT EXISTS public.tree_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.tree(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_tree_reports_tree_id ON public.tree_reports(tree_id);
CREATE INDEX idx_tree_reports_reporter_id ON public.tree_reports(reporter_id);
CREATE INDEX idx_tree_reports_status ON public.tree_reports(status);

-- Enable RLS
ALTER TABLE public.tree_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can insert their own reports
CREATE POLICY "Users can create tree reports"
  ON public.tree_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON public.tree_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Admins can view all reports (for future admin functionality)
CREATE POLICY "Admins can view all reports"
  ON public.tree_reports
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.guardian_rank = 'admin'
  ));

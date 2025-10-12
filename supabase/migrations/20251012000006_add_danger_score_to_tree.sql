-- Add danger_score column to tree table
ALTER TABLE public.tree
ADD COLUMN danger_score INTEGER DEFAULT 0 NOT NULL CHECK (danger_score >= 0 AND danger_score <= 100);

COMMENT ON COLUMN public.tree.danger_score IS 'Danger score indicating risk level for the tree (0-100)';

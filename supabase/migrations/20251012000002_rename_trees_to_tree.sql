-- Rename the trees table to tree
ALTER TABLE public.trees RENAME TO tree;

-- Update RLS policies to reference the new table name
-- Note: Policies are automatically transferred when renaming a table

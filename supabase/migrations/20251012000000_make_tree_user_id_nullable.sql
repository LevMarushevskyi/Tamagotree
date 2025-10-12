-- Make user_id nullable to allow trees to be reported without immediate adoption
ALTER TABLE public.trees
ALTER COLUMN user_id DROP NOT NULL;

-- Update the trees policies to allow anyone to insert trees (not just for themselves)
DROP POLICY IF EXISTS "Users can create their own trees" ON public.trees;

CREATE POLICY "Anyone can report trees"
  ON public.trees FOR INSERT
  WITH CHECK (true);

-- Allow users to update trees they don't own (for adoption purposes)
-- But we'll add logic to prevent changing ownership once set
DROP POLICY IF EXISTS "Users can update their own trees" ON public.trees;

CREATE POLICY "Users can update their own trees or adopt unadopted trees"
  ON public.trees FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Add a comment to document the adoption model
COMMENT ON COLUMN public.trees.user_id IS 'The user who has adopted this tree. NULL means the tree is available for adoption.';

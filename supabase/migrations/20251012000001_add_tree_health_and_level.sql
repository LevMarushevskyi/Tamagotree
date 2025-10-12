-- Add health_percentage and level fields to trees table
ALTER TABLE public.trees
ADD COLUMN health_percentage INTEGER DEFAULT 100 NOT NULL CHECK (health_percentage >= 0 AND health_percentage <= 100),
ADD COLUMN level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1);

-- Update existing trees to have default values
UPDATE public.trees
SET health_percentage = 100, level = 1
WHERE health_percentage IS NULL OR level IS NULL;

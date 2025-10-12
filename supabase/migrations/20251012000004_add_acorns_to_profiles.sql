-- Add acorns field to profiles table for quest currency
ALTER TABLE public.profiles
ADD COLUMN acorns INTEGER DEFAULT 0 NOT NULL CHECK (acorns >= 0);

-- Add comment to document the field
COMMENT ON COLUMN public.profiles.acorns IS 'Currency earned through completing quests and activities';

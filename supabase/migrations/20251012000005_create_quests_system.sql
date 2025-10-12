-- Create quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly')),
  category TEXT, -- 'care', 'social', 'competitive', etc.
  acorn_reward INTEGER DEFAULT 0,
  bp_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  tree_specific BOOLEAN DEFAULT false, -- true for per-tree quests, false for user-wide quests
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_quests table to track quest progress
CREATE TABLE IF NOT EXISTS public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  tree_id UUID REFERENCES public.tree(id) ON DELETE CASCADE, -- null for user-wide quests
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0, -- for multi-step quests
  last_reset_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, quest_id, tree_id) -- One quest per user per tree (or per user if tree_id is null)
);

-- Create indexes
CREATE INDEX idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX idx_user_quests_quest_id ON public.user_quests(quest_id);
CREATE INDEX idx_user_quests_tree_id ON public.user_quests(tree_id);
CREATE INDEX idx_user_quests_completed ON public.user_quests(completed);
CREATE INDEX idx_quests_type ON public.quests(quest_type);

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quests (everyone can read quests)
CREATE POLICY "Anyone can view quests"
  ON public.quests FOR SELECT
  USING (true);

-- RLS Policies for user_quests
CREATE POLICY "Users can view their own quest progress"
  ON public.user_quests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest progress"
  ON public.user_quests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest progress"
  ON public.user_quests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Seed daily care quests
INSERT INTO public.quests (name, description, quest_type, category, acorn_reward, bp_reward, xp_reward, tree_specific, icon) VALUES
  ('Morning Dew', 'Water your tree once today.', 'daily', 'care', 100, 100, 100, true, '💧'),
  ('Petal Performer', 'Sing to your sapling.', 'daily', 'care', 200, 50, 100, true, '🎵'),
  ('Leaf Collector', 'Clean up falling branches/leaves.', 'daily', 'care', 100, 200, 100, true, '🍂'),
  ('Tiny Gardener', 'Decorate your tree with a new accessory.', 'daily', 'care', 50, 50, 100, true, '🎨'),
  ('Weeder', 'Get rid of weeds in the area near your tree.', 'daily', 'care', 200, 100, 100, true, '🌿'),
  ('Community Synergy', 'Complete a daily care task for a friend.', 'daily', 'social', 250, 250, 100, true, '🤝');

-- Seed weekly quests
INSERT INTO public.quests (name, description, quest_type, category, acorn_reward, bp_reward, xp_reward, tree_specific, icon) VALUES
  ('Busy Bee', 'Complete a Daily Care Task every day of the week.', 'weekly', 'commitment', 1000, 0, 250, false, '🐝'),
  ('Social Butterfly', 'Add someone as a Friend.', 'weekly', 'social', 200, 0, 250, false, '🦋'),
  ('New Life', 'Plant a tree.', 'weekly', 'growth', 2500, 0, 250, false, '🌱'),
  ('TOP 10!', 'Maintain being in the top 10 spots in your local leaderboard for 3 consecutive days.', 'weekly', 'competitive', 1000, 0, 250, false, '🏅'),
  ('TOP 5!', 'Maintain being in the top 5 spots in your local leaderboard for 3 consecutive days.', 'weekly', 'competitive', 2000, 0, 250, false, '🥈'),
  ('ON TOP!', 'Maintain the top spot in your local leaderboard for 3 consecutive days.', 'weekly', 'competitive', 3000, 0, 250, false, '🥇');

COMMENT ON TABLE public.quests IS 'Available quests that users can complete';
COMMENT ON TABLE public.user_quests IS 'Tracks user progress on quests';
COMMENT ON COLUMN public.user_quests.progress IS 'Progress counter for multi-step quests (e.g., days completed for Busy Bee)';
COMMENT ON COLUMN public.user_quests.last_reset_at IS 'Timestamp of last reset - used to determine if quest should be reset';

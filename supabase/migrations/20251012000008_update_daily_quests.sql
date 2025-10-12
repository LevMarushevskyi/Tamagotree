-- Remove the quests that involve friends, collaboration, and accessories
DELETE FROM quests WHERE name IN ('Community Synergy', 'Tiny Gardener');

-- Keep only the 3 simple daily care quests:
-- 1. Morning Dew (Water your tree)
-- 2. Petal Performer (Sing to your sapling)
-- 3. Leaf Collector (Clean up falling branches/leaves)
-- 4. Weeder (Get rid of weeds)

COMMENT ON TABLE quests IS 'Quest definitions for daily and weekly quests. Daily quests reset every 18 hours after completion.';

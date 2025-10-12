-- Keep only 3 simple daily care quests as requested
DELETE FROM quests WHERE name = 'Weeder';

-- Final daily quests:
-- 1. Morning Dew (Water your tree) - 100 acorns, 100 BP
-- 2. Petal Performer (Sing to your sapling) - 200 acorns, 50 BP
-- 3. Leaf Collector (Clean up falling branches/leaves) - 100 acorns, 200 BP

import { supabase } from "@/integrations/supabase/client";

interface AchievementCheckResult {
  achievementName: string;
  unlocked: boolean;
  acornReward: number;
  bpReward: number;
}

/**
 * Check and award an achievement to a user if criteria are met
 */
export const checkAndAwardAchievement = async (
  userId: string,
  achievementName: string
): Promise<AchievementCheckResult | null> => {
  try {
    // Get achievement details
    const { data: achievement, error: achError } = await supabase
      .from("achievements")
      .select("id, name, acorn_reward, bp_reward")
      .eq("name", achievementName)
      .single();

    if (achError || !achievement) {
      console.error("Achievement not found:", achievementName);
      return null;
    }

    // Check if user already has this achievement
    const { data: existing, error: existError } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievement.id)
      .single();

    if (existing) {
      // Already unlocked
      return {
        achievementName: achievement.name,
        unlocked: false,
        acornReward: 0,
        bpReward: 0,
      };
    }

    // Award the achievement
    const { error: insertError } = await supabase
      .from("user_achievements")
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

    if (insertError) throw insertError;

    // Award rewards to user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("acorns, total_xp, level")
      .eq("id", userId)
      .single();

    if (profile) {
      const newAcorns = profile.acorns + (achievement.acorn_reward || 0);
      const newXP = profile.total_xp + (achievement.bp_reward || 0);

      await supabase
        .from("profiles")
        .update({
          acorns: newAcorns,
          total_xp: newXP,
        })
        .eq("id", userId);
    }

    return {
      achievementName: achievement.name,
      unlocked: true,
      acornReward: achievement.acorn_reward || 0,
      bpReward: achievement.bp_reward || 0,
    };
  } catch (error) {
    console.error("Error checking achievement:", error);
    return null;
  }
};

/**
 * Check tree-based achievements
 */
export const checkTreeAchievements = async (userId: string) => {
  try {
    // Get user's tree count
    const { data: trees, error: treeError } = await supabase
      .from("tree")
      .select("id, level, age_days")
      .eq("user_id", userId);

    if (treeError || !trees) return;

    const treeCount = trees.length;
    const achievementsToCheck: string[] = [];

    // Tree planting achievements
    if (treeCount >= 1) achievementsToCheck.push("Life Bringer");
    if (treeCount >= 5) {
      achievementsToCheck.push("Arborist");
      achievementsToCheck.push("Branch Manager");
    }
    if (treeCount >= 10) achievementsToCheck.push("Lean Green Climate Action Machine");

    // Bloom level achievements
    const level5Trees = trees.filter((t) => t.level >= 5);
    if (level5Trees.length >= 1) achievementsToCheck.push("Little Gardener");
    if (level5Trees.length >= 5) achievementsToCheck.push("Forest Tender");

    // Tree maintenance achievements (based on age)
    const oldestTree = trees.reduce((max, tree) =>
      tree.age_days > max ? tree.age_days : max, 0
    );
    if (oldestTree >= 10) achievementsToCheck.push("Rising Hope");
    if (oldestTree >= 50) achievementsToCheck.push("Grove Guardian");
    if (oldestTree >= 100) achievementsToCheck.push("Savior");

    // Check all achievements
    for (const achName of achievementsToCheck) {
      await checkAndAwardAchievement(userId, achName);
    }
  } catch (error) {
    console.error("Error checking tree achievements:", error);
  }
};

/**
 * Check acorn-based achievements
 */
export const checkAcornAchievements = async (userId: string, totalAcorns: number) => {
  const achievementsToCheck: string[] = [];

  if (totalAcorns >= 1000) achievementsToCheck.push("Money doesn't grow on trees.");
  if (totalAcorns >= 5000) achievementsToCheck.push("Entreepreneur");
  if (totalAcorns >= 10000) achievementsToCheck.push("Making Bark Bank");

  for (const achName of achievementsToCheck) {
    await checkAndAwardAchievement(userId, achName);
  }
};

/**
 * Check leaderboard achievements
 */
export const checkLeaderboardAchievements = async (userId: string, rank: number) => {
  const achievementsToCheck: string[] = [];

  if (rank <= 50) achievementsToCheck.push("County Leader");
  if (rank <= 10) achievementsToCheck.push("County Superstar");
  if (rank === 1) achievementsToCheck.push("County Legend");

  for (const achName of achievementsToCheck) {
    await checkAndAwardAchievement(userId, achName);
  }
};

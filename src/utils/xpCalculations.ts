/**
 * Calculate the XP required for a given level using a scaling formula
 * Formula: baseXP * (level ^ exponent)
 * This creates an exponential curve where each level requires more XP
 */
export const calculateXPForLevel = (level: number): number => {
  const baseXP = 100; // XP required for level 2
  const exponent = 1.5; // Exponential growth factor

  if (level <= 1) return 0;

  return Math.floor(baseXP * Math.pow(level, exponent));
};

/**
 * Calculate the total XP required to reach a specific level
 */
export const calculateTotalXPForLevel = (level: number): number => {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += calculateXPForLevel(i);
  }
  return totalXP;
};

/**
 * Calculate the current level based on total XP
 */
export const calculateLevelFromXP = (totalXP: number): number => {
  let level = 1;
  let xpForNextLevel = calculateXPForLevel(2);
  let accumulatedXP = 0;

  while (totalXP >= accumulatedXP + xpForNextLevel) {
    accumulatedXP += xpForNextLevel;
    level++;
    xpForNextLevel = calculateXPForLevel(level + 1);
  }

  return level;
};

/**
 * Calculate XP progress for the current level
 * Returns { current: XP in current level, required: XP needed for next level }
 */
export const calculateLevelProgress = (totalXP: number): { current: number; required: number; level: number } => {
  const level = calculateLevelFromXP(totalXP);
  const xpForCurrentLevel = calculateTotalXPForLevel(level);
  const xpForNextLevel = calculateXPForLevel(level + 1);
  const currentLevelXP = totalXP - xpForCurrentLevel;

  return {
    level,
    current: currentLevelXP,
    required: xpForNextLevel,
  };
};

/**
 * Check if leveling up occurred and return new level
 */
export const checkLevelUp = (oldXP: number, newXP: number): { leveledUp: boolean; oldLevel: number; newLevel: number } => {
  const oldLevel = calculateLevelFromXP(oldXP);
  const newLevel = calculateLevelFromXP(newXP);

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
};

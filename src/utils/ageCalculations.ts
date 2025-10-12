/**
 * Calculate the age of a tree in days based on when it was created
 * @param createdAt - ISO timestamp string or Date when the tree was created
 * @returns Age in days (rounded down)
 */
export const calculateTreeAgeDays = (createdAt: string | Date): number => {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffInDays); // Never return negative days
};

/**
 * Format age in a human-readable way
 * @param ageDays - Age in days
 * @returns Formatted string like "5 days" or "1 day"
 */
export const formatTreeAge = (ageDays: number): string => {
  if (ageDays === 0) return "Planted today";
  if (ageDays === 1) return "1 day old";
  return `${ageDays} days old`;
};

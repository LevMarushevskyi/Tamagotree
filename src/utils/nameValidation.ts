/**
 * Name validation utilities for usernames and tree names
 */

// Common profanity words to filter (expandable list)
const PROFANITY_LIST = [
  'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'ass', 'asshole',
  'bastard', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
  'fag', 'nigger', 'nigga', 'retard', 'retarded', 'idiot',
  // Add variations with common obfuscations
  'sh1t', 'f*ck', 'b1tch', 'a$$', '@ss', 'fuk', 'fuq', 'phuck',
  's**t', 'b**ch', 'd**k', 'c**k', 'sh!t', 'a55', 'azz'
];

// Maximum character limits
export const MAX_USERNAME_LENGTH = 15;
export const MAX_TREE_NAME_LENGTH = 15;

/**
 * Check if a string contains profanity
 */
export const containsProfanity = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();

  // Check for exact matches and substrings
  return PROFANITY_LIST.some(word => {
    const pattern = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return pattern.test(normalizedText);
  });
};

/**
 * Validate username
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  const trimmed = username.trim();

  if (!trimmed) {
    return { valid: false, error: 'Username is required' };
  }

  if (trimmed.length > MAX_USERNAME_LENGTH) {
    return { valid: false, error: `Username must be ${MAX_USERNAME_LENGTH} characters or less` };
  }

  if (containsProfanity(trimmed)) {
    return { valid: false, error: 'Username contains inappropriate language' };
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
};

/**
 * Validate tree name
 */
export const validateTreeName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Tree name is required' };
  }

  if (trimmed.length > MAX_TREE_NAME_LENGTH) {
    return { valid: false, error: `Tree name must be ${MAX_TREE_NAME_LENGTH} characters or less` };
  }

  if (containsProfanity(trimmed)) {
    return { valid: false, error: 'Tree name contains inappropriate language' };
  }

  return { valid: true };
};

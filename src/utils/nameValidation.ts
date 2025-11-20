const PROFANITY_LIST = [
  'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'ass', 'asshole',
  'bastard', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
  'fag', 'nigger', 'nigga', 'retard', 'retarded', 'idiot',
  'sh1t', 'f*ck', 'b1tch', 'a$$', '@ss', 'fuk', 'fuq', 'phuck',
  's**t', 'b**ch', 'd**k', 'c**k', 'sh!t', 'a55', 'azz'
];

export const MAX_USERNAME_LENGTH = 15;
export const MAX_TREE_NAME_LENGTH = 15;

export const containsProfanity = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();

  return PROFANITY_LIST.some(word => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escapedWord}\\b|${escapedWord}`, 'i');
    return pattern.test(normalizedText);
  });
};

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

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
};

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

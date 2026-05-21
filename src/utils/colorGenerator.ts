const AVATAR_COLORS = [
  { blob: '#FFB088', accent: '#FF7A3D' }, // Orange
  { blob: '#D5C2FF', accent: '#8B5CF6' }, // Purple
  { blob: '#E2FD98', accent: '#BEF264' }, // Lime
  { blob: '#A7F3D0', accent: '#06B6D4' }, // Cyan
  { blob: '#FEF08A', accent: '#FACC15' }, // Yellow
];

/**
 * Gets avatar color by index with consistent hashing
 * Time complexity: O(1)
 */
export function getAvatarColorByIndex(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

/**
 * Generates a random avatar seed
 * Time complexity: O(1)
 */
export function generateAvatarSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}
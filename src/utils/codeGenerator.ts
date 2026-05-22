const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a random room code in format "XXXXXX" (no hyphen)
 * Time complexity: O(n) where n = code length (constant)
 * Space complexity: O(1)
 */
export function generateRoomCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    code += CHARS[randomIndex];
  }
  return code;
}

/**
 * Validates room code format (supports both 6 characters without hyphen or 3-3 with hyphen)
 * Time complexity: O(n)
 */
export function isValidRoomCode(code: string): boolean {
  const upper = code.toUpperCase();
  return /^[A-Z2-9]{6}$/.test(upper) || /^[A-Z2-9]{3}-[A-Z2-9]{3}$/.test(upper);
}
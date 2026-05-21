const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a random room code in format "XXX-XXX"
 * Time complexity: O(n) where n = code length (constant)
 * Space complexity: O(1)
 */
export function generateRoomCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    code += CHARS[randomIndex];
  }
  // Format as "XXX-XXX"
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * Validates room code format
 * Time complexity: O(n)
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(code.toUpperCase());
}
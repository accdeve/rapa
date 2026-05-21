const LOCALE = 'id-ID';
const CURRENCY = 'IDR';

/**
 * Formats number as IDR currency
 * Time complexity: O(1)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates meeting cost based on participants and duration
 * Time complexity: O(1)
 */
export function calculateMeetingCost(
  participants: number,
  hourlyRate: number = 250000,
  durationHours: number = 4
): number {
  return participants * hourlyRate * durationHours;
}

/**
 * Calculates savings (50% reduction)
 * Time complexity: O(1)
 */
export function calculateSavings(cost: number, reductionPercent: number = 0.5): number {
  return cost * reductionPercent;
}
/**
 * Calculates pagination metadata
 * Time complexity: O(1)
 */
export function calculatePagination(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    offset: (page - 1) * limit,
  };
}

/**
 * Creates a range of page numbers for pagination UI
 * Time complexity: O(n) where n = visible page count (typically 5-7)
 */
export function getVisiblePageRange(currentPage: number, totalPages: number, delta: number = 2): number[] {
  const range: number[] = [];
  
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }
  
  if (currentPage - delta > 2) {
    range.unshift(1);
  }
  if (currentPage + delta < totalPages - 1) {
    range.push(totalPages);
  }
  
  return range;
}
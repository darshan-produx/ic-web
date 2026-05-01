/**
 * Formats a number to a compact representation with K, M, B suffixes
 * and limits decimals to 2 places.
 * 
 * @param value - The number to format
 * @param maxDecimals - Maximum decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5k", "2.3M", "1.2B")
 */
export function formatNumber(value: number | string | undefined | null, maxDecimals: number = 2): string {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  // Convert to number if string
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(num)) {
    return '0';
  }

  // Handle zero
  if (num === 0) {
    return '0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // Billions
  if (absNum >= 1_000_000_000) {
    const formatted = (absNum / 1_000_000_000).toFixed(maxDecimals);
    return `${sign}${removeTrailingZeros(formatted)}B`;
  }
  
  // Millions
  if (absNum >= 1_000_000) {
    const formatted = (absNum / 1_000_000).toFixed(maxDecimals);
    return `${sign}${removeTrailingZeros(formatted)}M`;
  }
  
  // Thousands
  if (absNum >= 1_000) {
    const formatted = (absNum / 1_000).toFixed(maxDecimals);
    return `${sign}${removeTrailingZeros(formatted)}k`;
  }

  // Less than 1000 - show with max decimals
  const formatted = absNum.toFixed(maxDecimals);
  return `${sign}${removeTrailingZeros(formatted)}`;
}

/**
 * Removes trailing zeros after decimal point
 * e.g., "1.50" -> "1.5", "2.00" -> "2"
 */
function removeTrailingZeros(numStr: string): string {
  if (!numStr.includes('.')) {
    return numStr;
  }
  return numStr.replace(/\.?0+$/, '');
}

/**
 * Formats a percentage value with max 2 decimals
 */
export function formatPercentage(value: number | string | undefined | null, maxDecimals: number = 2): string {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0%';
  }

  const formatted = num.toFixed(maxDecimals);
  return `${removeTrailingZeros(formatted)}%`;
}

/**
 * Formats currency with symbol and compact notation
 */
export function formatCurrency(value: number | string | undefined | null, symbol: string = '$', maxDecimals: number = 2): string {
  const formatted = formatNumber(value, maxDecimals);
  return `${symbol}${formatted}`;
}

/**
 * Formats a regular number with max decimal places (no K/M/B)
 */
export function formatDecimal(value: number | string | undefined | null, maxDecimals: number = 2): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }

  const formatted = num.toFixed(maxDecimals);
  return removeTrailingZeros(formatted);
}

/**
 * Format currency in Indonesian Rupiah format
 * @param amount - The amount to format
 * @returns Formatted currency string with "Rp" prefix and thousands separators
 */
export function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with custom prefix
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: 'IDR' | 'USD' | 'EUR'): string {
  switch (currency) {
    case 'IDR':
      return formatCurrencyIDR(amount);
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);
    default:
      return amount.toString();
  }
}
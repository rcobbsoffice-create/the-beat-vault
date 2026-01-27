/**
 * AudioGenes Music ID Utilities
 * Handles ISRC and UPC generation/validation
 */

/**
 * Generate a mock ISRC (International Standard Recording Code)
 * Format: CC-XXX-YY-NNNNN
 * CC: Country (e.g., US)
 * XXX: Registrant (e.g., TF1)
 * YY: Year (e.g., 26)
 * NNNNN: Unique Designation
 */
export function generateISRC(countryCode: string = 'US', registrantCode: string = 'TF1'): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const designation = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${countryCode}-${registrantCode}-${year}-${designation}`;
}

/**
 * Validates an ISRC format
 */
export function validateISRC(isrc: string): boolean {
  const regex = /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/;
  return regex.test(isrc);
}

/**
 * Generate a mock UPC (Universal Product Code)
 * Format: 12-digit numeric
 */
export function generateUPC(): string {
  // AudioGenes prefix could be 190 (common for digital music)
  const prefix = '190';
  const rest = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `${prefix}${rest}`;
}

/**
 * Validates a UPC format
 */
export function validateUPC(upc: string): boolean {
  return /^\d{12}$/.test(upc);
}

/**
 * Money is stored and passed as integer minor units (LKR cents) everywhere.
 * Format only at the UI edge.
 */

export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

/**
 * Integer basis-point percentage with round-half-away-from-zero.
 * `percent` is a human percentage: 10 means 10%, 2.5 means 2.5%.
 */
export function pct(amountMinor: number, percent: number): number {
  const basisPoints = Math.round(percent * 100);
  const sign = amountMinor < 0 ? -1 : 1;
  return sign * Math.floor((Math.abs(amountMinor) * basisPoints + 5_000) / 10_000);
}

export function formatLKR(minor: number, options: { decimals?: boolean } = {}): string {
  const decimals = options.decimals ?? false;
  const value = Math.abs(minor) / 100;
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(value);
  return `${minor < 0 ? "−" : ""}LKR ${formatted}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

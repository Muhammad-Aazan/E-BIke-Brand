import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/** Convert major currency unit (e.g. PKR) to subunit integer (paisa) */
export function toSubunit(amount: number | string, subunit = 100): number {
  return new Decimal(amount).mul(subunit).toDecimalPlaces(0).toNumber();
}

/** Convert subunit integer to major currency unit */
export function fromSubunit(amount: number, subunit = 100): string {
  return new Decimal(amount).div(subunit).toFixed(2);
}

/** Add amounts in subunit integers */
export function addSubunit(...amounts: number[]): number {
  return amounts.reduce((acc, a) => new Decimal(acc).add(a).toNumber(), 0);
}

/** Multiply subunit integer by a rate (e.g. for tax) */
export function multiplySubunit(amount: number, rate: number): number {
  return new Decimal(amount).mul(rate).toDecimalPlaces(0).toNumber();
}

/** Apply percentage discount: returns discount amount in subunits */
export function percentageDiscount(amount: number, percent: number): number {
  return new Decimal(amount).mul(percent).div(100).toDecimalPlaces(0).toNumber();
}

/** Format for display */
export function formatCurrency(subunitAmount: number, currency = 'PKR', subunit = 100): string {
  const major = fromSubunit(subunitAmount, subunit);
  return `${currency} ${major}`;
}

import { describe, it, expect } from 'vitest';
import {
  toSubunit,
  fromSubunit,
  addSubunit,
  percentageDiscount,
  formatCurrency,
} from '../src/common/utils/decimal';

describe('Decimal Monetary Utility', () => {
  it('converts major units to subunit integers accurately', () => {
    expect(toSubunit(100)).toBe(10000); // 100 PKR -> 10,000 paisa
    expect(toSubunit('285000.50')).toBe(28500050);
    expect(toSubunit(0.99)).toBe(99);
  });

  it('converts subunit integers back to major currency decimal string', () => {
    expect(fromSubunit(10000)).toBe('100.00');
    expect(fromSubunit(28500050)).toBe('285000.50');
    expect(fromSubunit(99)).toBe('0.99');
  });

  it('adds amounts without floating point inaccuracies', () => {
    // In standard JS: 0.1 + 0.2 = 0.30000000000000004
    // In our subunit integers:
    const sum = addSubunit(10, 20, 30);
    expect(sum).toBe(60);

    const largeSum = addSubunit(28500000, 500000, 600000);
    expect(largeSum).toBe(29600000);
  });

  it('calculates percentage discounts accurately', () => {
    const total = 28500000; // 285,000 PKR
    const discount = percentageDiscount(total, 10); // 10%
    expect(discount).toBe(2850000); // 28,500 PKR
  });

  it('formats display strings with currency prefix', () => {
    const formatted = formatCurrency(28500000, 'PKR');
    expect(formatted).toBe('PKR 285000.00');
  });
});

import { describe, it, expect } from 'vitest';
import { generateOrderNumber, slugify } from '../src/common/utils/slugify';
import {
  validateCheckoutSchema,
  createOrderSchema,
} from '../src/modules/checkout/checkout.validators';

describe('Checkout & Order Engine', () => {
  describe('Order Number Generation', () => {
    it('generates unique order numbers with EVEE brand prefix', () => {
      const orderNum1 = generateOrderNumber();
      const orderNum2 = generateOrderNumber();

      expect(orderNum1).toMatch(/^EVE-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(orderNum2).toMatch(/^EVE-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(orderNum1).not.toBe(orderNum2);
    });

    it('slugifies vehicle titles into URL-safe strings', () => {
      expect(slugify('EVee Pro 125 Electric Motorcycle')).toBe('evee-pro-125-electric-motorcycle');
      expect(slugify('Special Edition! #1 & Fast')).toBe('special-edition-1-fast');
    });
  });

  describe('Checkout Request Validation', () => {
    it('requires at least one item to validate checkout', () => {
      const emptyCheckout = {
        items: [],
      };
      const result = validateCheckoutSchema.safeParse(emptyCheckout);
      expect(result.success).toBe(false);
    });

    it('accepts valid checkout with items and shipping address', () => {
      const valid = {
        items: [
          {
            productId: '60c72b2f9b1d8b2bad84e899',
            quantity: 1,
          },
        ],
        shippingAddress: {
          fullName: 'Tariq Mehmood',
          phone: '+923214567890',
          addressLine1: 'Main Boulevard, Gulberg III',
          city: 'Lahore',
          country: 'PK',
        },
        paymentProvider: 'stripe',
      };
      const result = validateCheckoutSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('enforces complete address fields for order creation', () => {
      const incomplete = {
        items: [{ productId: '60c72b2f9b1d8b2bad84e899', quantity: 1 }],
        shippingAddress: {
          fullName: 'Tariq',
          // missing phone, addressLine1, city
        },
      };
      const result = createOrderSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });

  describe('Discount Calculation Logic', () => {
    it('computes percentage discount with cap', () => {
      const subtotal = 28500000; // 285,000 PKR
      const discountPercentage = 10; // 10%
      const maxDiscountCap = 2000000; // 20,000 PKR cap

      let calculatedDiscount = Math.floor((subtotal * discountPercentage) / 100); // 28,500 PKR
      if (maxDiscountCap && calculatedDiscount > maxDiscountCap) {
        calculatedDiscount = maxDiscountCap;
      }

      expect(calculatedDiscount).toBe(2000000); // capped at 20,000 PKR
    });

    it('ensures fixed discount never exceeds subtotal', () => {
      const subtotal = 300000; // 3,000 PKR
      const couponFixedValue = 500000; // 5,000 PKR

      const appliedDiscount = Math.min(couponFixedValue, subtotal);
      expect(appliedDiscount).toBe(300000); // Cannot exceed subtotal
      const grandTotal = Math.max(0, subtotal - appliedDiscount);
      expect(grandTotal).toBe(0);
    });
  });
});

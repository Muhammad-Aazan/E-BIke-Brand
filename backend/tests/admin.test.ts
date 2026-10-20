import { describe, it, expect } from 'vitest';
import {
  updateOrderStatusSchema,
  addShipmentDetailsSchema,
  adjustStockSchema,
} from '../src/modules/admin/admin.validators';

describe('Admin Operations & Order Lifecycle', () => {
  describe('Status Transition Validation', () => {
    it('accepts valid order status updates', () => {
      const valid = { status: 'confirmed', note: 'Customer called and confirmed delivery address' };
      const result = updateOrderStatusSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid order status values', () => {
      const invalid = { status: 'flying_to_mars' };
      const result = updateOrderStatusSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Shipment Tracking Validation', () => {
    it('accepts complete shipment dispatch details', () => {
      const valid = {
        carrier: 'Leopard Courier Express',
        trackingNumber: 'LEO-987654321',
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        notifyCustomer: true,
      };
      const result = addShipmentDetailsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects shipment without tracking number', () => {
      const invalid = { carrier: 'DHL', trackingNumber: '' };
      const result = addShipmentDetailsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Stock Adjustment Validation', () => {
    it('accepts positive restock adjustment', () => {
      const valid = {
        productId: '60c72b2f9b1d8b2bad84e899',
        sku: 'EVE-M125-PRO',
        quantityDelta: 20,
        movementType: 'restock',
        note: 'New factory batch received from Crown Motors assembly',
      };
      const result = adjustStockSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('accepts negative damage / write-off adjustment', () => {
      const valid = {
        productId: '60c72b2f9b1d8b2bad84e899',
        sku: 'EVE-M125-PRO',
        quantityDelta: -1,
        movementType: 'damage',
        note: 'Damaged in warehouse transit',
      };
      const result = adjustStockSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});

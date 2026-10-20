import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Live API HTTP Integration Tests', () => {
  describe('System & Health API', () => {
    it('GET /api/v1/health responds with service details', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.body).toHaveProperty('success');
      expect(res.body.data).toHaveProperty('service', 'EVee API');
      expect(res.body.data).toHaveProperty('version', '1.0.0');
    });

    it('GET /api/v1/non-existent-route returns meaningful 404 error', async () => {
      const res = await request(app).get('/api/v1/some-unknown-path-12345');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('NOT_FOUND');
      expect(res.body.error).toContain('Cannot GET /api/v1/some-unknown-path-12345');
    });
  });

  describe('Auth Validation & Meaningful Regex Errors', () => {
    it('POST /api/v1/auth/register rejects weak password with detailed regex messages', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'H', // too short
          email: 'not-an-email',
          password: 'weak',
          phone: 'invalid-phone-xyz',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(typeof res.body.error).toBe('string');
      expect(res.body.details).toBeInstanceOf(Array);

      // Check field-level descriptive error messages
      const fields = res.body.details.map((d: any) => d.field);
      expect(fields).toContain('name');
      expect(fields).toContain('email');
      expect(fields).toContain('password');
      expect(fields).toContain('phone');

      const passDetail = res.body.details.find((d: any) => d.field === 'password');
      expect(passDetail.message).toContain('at least 8 characters');
    });

    it('POST /api/v1/auth/register enforces uppercase, lowercase, numbers, and special characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hamza Ali',
          email: 'hamza@example.com',
          password: 'PasswordWithoutSpecial1', // missing special char
        });

      expect(res.status).toBe(422);
      const passDetail = res.body.details.find((d: any) => d.field === 'password');
      expect(passDetail.message).toContain('special character');
    });

    it('POST /api/v1/auth/login requires valid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'bad-email-format',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(422);
      expect(res.body.details[0].field).toBe('email');
      expect(res.body.details[0].message).toContain('valid email address');
    });

    it('GET /api/v1/auth/me rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Shipping API', () => {
    it('GET /api/v1/shipping/calculate returns delivery options for Pakistan', async () => {
      const res = await request(app)
        .get('/api/v1/shipping/calculate')
        .query({ country: 'PK', subtotal: 28500000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.methods).toBeInstanceOf(Array);
      expect(res.body.data.methods.length).toBeGreaterThan(0);
      expect(res.body.data.methods[0]).toHaveProperty('calculatedFee');
    });

    it('GET /api/v1/shipping/calculate validates country code format', async () => {
      const res = await request(app)
        .get('/api/v1/shipping/calculate')
        .query({ country: 'PAKISTAN_TOO_LONG' });

      expect(res.status).toBe(422);
      expect(res.body.details[0].field).toBe('country');
      expect(res.body.details[0].message).toContain('Country code must be exactly 2 characters');
    });
  });

  describe('Coupons API', () => {
    it('GET /api/v1/coupons/validate rejects invalid coupon code format with regex message', async () => {
      const res = await request(app)
        .get('/api/v1/coupons/validate')
        .query({ code: 'a!' }); // invalid regex (lowercase with special char !)

      expect(res.status).toBe(422);
      expect(res.body.details[0].field).toBe('code');
      expect(res.body.details[0].message).toContain('3-30 letters/numbers');
    });
  });

  describe('Checkout API', () => {
    it('POST /api/v1/checkout/validate rejects empty cart items with clear message', async () => {
      const res = await request(app)
        .post('/api/v1/checkout/validate')
        .send({ items: [] });

      expect(res.status).toBe(422);
      expect(res.body.details[0].field).toBe('items');
      expect(res.body.details[0].message).toContain('At least one item is required');
    });

    it('POST /api/v1/checkout/validate rejects invalid Product ObjectId format', async () => {
      const res = await request(app)
        .post('/api/v1/checkout/validate')
        .send({
          items: [{ productId: 'invalid-id-123', quantity: 1 }],
        });

      expect(res.status).toBe(422);
      expect(res.body.details[0].field).toBe('items.0.productId');
      expect(res.body.details[0].message).toContain('ObjectId format');
    });
  });

  describe('Orders API', () => {
    it('POST /api/v1/orders/track/:orderNumber checks missing order gracefully', async () => {
      const res = await request(app).get('/api/v1/orders/track/EVE-NONEXISTENT-999');
      // If DB not connected or order not found, returns appropriate error
      expect([404, 500]).toContain(res.status);
    });

    it('POST /api/v1/orders/:orderNumber/cancel rejects unauthenticated requests', async () => {
      const res = await request(app).post('/api/v1/orders/EVE-123/cancel').send({ reason: 'Changed mind' });
      expect(res.status).toBe(401);
    });
  });

  describe('Payments & Stripe Webhook API', () => {
    it('POST /api/v1/payments/stripe/webhook rejects request without stripe signature', async () => {
      const res = await request(app)
        .post('/api/v1/payments/stripe/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'test' }));

      expect(res.status).toBe(402);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Stripe webhook');
    });
  });

  describe('Admin Role-Based Security', () => {
    it('GET /api/v1/admin/orders strictly blocks unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/admin/orders');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/admin/customers strictly blocks unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/admin/customers');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/admin/inventory/adjust strictly blocks unauthenticated requests', async () => {
      const res = await request(app).post('/api/v1/admin/inventory/adjust').send({});
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/analytics/overview strictly blocks non-admins', async () => {
      const res = await request(app).get('/api/v1/analytics/overview');
      expect(res.status).toBe(401);
    });
  });
});

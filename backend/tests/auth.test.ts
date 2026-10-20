import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  registerSchema,
  loginSchema,
} from '../src/modules/auth/auth.validators';
import {
  hashToken,
  generateSecureToken,
} from '../src/modules/auth/auth.service';
import { config } from '../src/config';

describe('Auth Module & Security', () => {
  describe('Validation Schemas', () => {
    it('accepts valid registration payload', () => {
      const valid = {
        name: 'Bilal Khan',
        email: 'bilal@evee.pk',
        password: 'Password123!',
        phone: '+923001234567',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const invalid = {
        name: 'Bilal',
        email: 'bilal@evee.pk',
        password: 'Pass1',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects passwords without numbers or uppercase', () => {
      const invalid = {
        name: 'Bilal',
        email: 'bilal@evee.pk',
        password: 'passwordonly',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('normalizes email to lowercase', () => {
      const input = {
        name: 'Bilal',
        email: 'BILAL.KHAN@EVEE.PK',
        password: 'Password123!',
      };
      const parsed = registerSchema.parse(input);
      expect(parsed.email).toBe('bilal.khan@evee.pk');
    });

    it('validates login input', () => {
      const invalid = { email: 'not-an-email', password: '' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Token Security Helpers', () => {
    it('generates secure random hex tokens with sufficient entropy', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });

    it('hashes tokens deterministically with SHA-256', () => {
      const token = 'my_plain_token_123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).not.toBe(token);
    });

    it('signs and verifies JWT access tokens with correct payload', () => {
      const payload = {
        userId: '60c72b2f9b1d8b2bad84e899',
        role: 'customer' as const,
        email: 'customer@evee.pk',
      };

      const token = jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '15m' });
      const decoded = jwt.verify(token, config.jwt.accessSecret) as typeof payload;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe('customer');
      expect(decoded.email).toBe(payload.email);
    });

    it('rejects tampered JWT tokens', () => {
      const payload = { userId: '123', role: 'customer' };
      const token = jwt.sign(payload, 'wrong_secret');

      expect(() => {
        jwt.verify(token, config.jwt.accessSecret);
      }).toThrow();
    });
  });
});

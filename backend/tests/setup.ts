import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_must_be_at_least_64_characters_long_for_security_12345';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_must_be_at_least_64_characters_long_for_security_12345';
  process.env.COOKIE_SECRET = 'test_cookie_secret';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_key';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_webhook_secret';
});

afterAll(() => {
  // teardown if needed
});

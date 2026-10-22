import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (two levels up from backend/src)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requireEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue = ''): string {
  return process.env[name] ?? defaultValue;
}

function numEnv(name: string, defaultValue: number): number {
  const val = process.env[name];
  return val ? parseInt(val, 10) : defaultValue;
}

function boolEnv(name: string, defaultValue: boolean): boolean {
  const val = process.env[name];
  if (!val) return defaultValue;
  return val.toLowerCase() === 'true' || val === '1';
}

export const config = {
  env: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  server: {
    port: numEnv('PORT', 5000),
    apiBaseUrl: optionalEnv('API_BASE_URL', 'http://localhost:5000'),
    frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
    corsOrigins: optionalEnv('CORSED_ORIGINS', 'http://localhost:3000').split(',').map(s => s.trim()),
  },

  db: {
    uri: optionalEnv('MONGODB_URI', 'mongodb://localhost:27017/evee_db'),
    name: optionalEnv('MONGODB_DB_NAME', 'evee_db'),
  },

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_production_minimum_64_chars'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production_minimum_64_chars'),
    accessExpiry: optionalEnv('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optionalEnv('JWT_REFRESH_EXPIRY', '7d'),
  },

  cookie: {
    secret: requireEnv('COOKIE_SECRET', 'dev_cookie_secret_change_in_production'),
    secure: boolEnv('COOKIE_SECURE', process.env.NODE_ENV === 'production'),
    sameSite: (optionalEnv('COOKIE_SAMESITE', 'lax') as 'lax' | 'strict' | 'none'),
  },

  redis: {
    url: optionalEnv('REDIS_URL', ''),
  },

  bcrypt: {
    saltRounds: numEnv('BCRYPT_SALT_ROUNDS', 12),
  },

  rateLimit: {
    windowMs: numEnv('RATE_LIMIT_WINDOW_MS', 60_000),
    general: numEnv('RATE_LIMIT_GENERAL_MAX', 100),
    auth: numEnv('RATE_LIMIT_AUTH_MAX', 10),
    checkout: numEnv('RATE_LIMIT_CHECKOUT_MAX', 5),
    search: numEnv('RATE_LIMIT_SEARCH_MAX', 30),
  },

  payment: {
    provider: (optionalEnv('PAYMENT_PROVIDER', 'stripe') as 'stripe' | 'cod'),
  },

  stripe: {
    secretKey: optionalEnv('STRIPE_SECRET_KEY', ''),
    publishableKey: optionalEnv('STRIPE_PUBLISHABLE_KEY', ''),
    webhookSecret: optionalEnv('STRIPE_WEBHOOK_SECRET', ''),
    currency: optionalEnv('STRIPE_CURRENCY', 'pkr'),
    successUrl: optionalEnv('STRIPE_SUCCESS_URL', 'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}'),
    cancelUrl: optionalEnv('STRIPE_CANCEL_URL', 'http://localhost:3000/checkout/cancel'),
    apiVersion: optionalEnv('STRIPE_API_VERSION', '2025-06-30') as '2025-06-30',
  },

  cloudinary: {
    cloudName: optionalEnv('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optionalEnv('CLOUDINARY_API_KEY', ''),
    apiSecret: optionalEnv('CLOUDINARY_API_SECRET', ''),
    uploadPreset: optionalEnv('CLOUDINARY_UPLOAD_PRESET', 'evee_products'),
  },

  imagekit: {
    privateKey: optionalEnv('IMAGEKIT_PRIVATE_KEY', 'private_oLjGFIXZ5fI5412XlxDSMBXrKi0='),
    publicKey: optionalEnv('IMAGEKIT_PUBLIC_KEY', 'public_9znI8VLlozVy8R6CJMqpY9tQuCU='),
    urlEndpoint: optionalEnv('IMAGEKIT_URL_ENDPOINT', 'https://ik.imagekit.io/qbwmuvvwo'),
  },

  smtp: {
    host: optionalEnv('SMTP_HOST', 'smtp.mailtrap.io'),
    port: numEnv('SMTP_PORT', 587),
    secure: boolEnv('SMTP_SECURE', false),
    user: optionalEnv('SMTP_USER', ''),
    pass: optionalEnv('SMTP_PASS', ''),
    fromName: optionalEnv('EMAIL_FROM_NAME', 'EVee by Crown Motors'),
    fromAddress: optionalEnv('EMAIL_FROM_ADDRESS', 'noreply@evee.pk'),
  },

  store: {
    name: optionalEnv('STORE_NAME', 'EVee'),
    company: optionalEnv('STORE_COMPANY', 'Crown Motors'),
    currency: optionalEnv('STORE_CURRENCY', 'PKR'),
    currencySubunit: numEnv('STORE_CURRENCY_SUBUNIT', 100),
    locale: optionalEnv('STORE_LOCALE', 'en'),
    country: optionalEnv('STORE_COUNTRY', 'PK'),
    supportEmail: optionalEnv('STORE_SUPPORT_EMAIL', 'support@evee.pk'),
    supportPhone: optionalEnv('STORE_SUPPORT_PHONE', ''),
  },

  seed: {
    adminEmail: optionalEnv('SEED_ADMIN_EMAIL', 'admin@evee.pk'),
    adminPassword: optionalEnv('SEED_ADMIN_PASSWORD', 'Admin@EVee2024!'),
    adminName: optionalEnv('SEED_ADMIN_NAME', 'EVee Admin'),
  },

  logging: {
    level: optionalEnv('LOG_LEVEL', 'info'),
    dir: optionalEnv('LOG_DIR', 'logs'),
  },
} as const;

export type Config = typeof config;

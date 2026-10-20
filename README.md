# EVee E-Commerce Backend
### Crown Motors | Premium Electric Mobility Brand

> Production-grade, high-performance Node.js / TypeScript REST API powering the **EVee** electric vehicle e-commerce storefront, customer account system, decimal-safe checkout engine, payment gateway provider abstraction, and secure administrative operations.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation & Quick Start](#3-installation--quick-start)
4. [Environment Variables](#4-environment-variables)
5. [Database Design & MongoDB Configuration](#5-database-design--mongodb-configuration)
6. [Available Scripts](#6-available-scripts)
7. [Database Seeding](#7-database-seeding)
8. [API Documentation (OpenAPI / Swagger)](#8-api-documentation-openapi--swagger)
9. [Authentication Flow & Security](#9-authentication-flow--security)
10. [Checkout & Inventory Engine](#10-checkout--inventory-engine)
11. [Payment Provider Architecture](#11-payment-provider-architecture)
    - [Stripe Checkout Integration](#stripe-checkout-integration)
    - [Stripe Webhook Signature Verification & Idempotency](#stripe-webhook-signature-verification--idempotency)
    - [Cash on Delivery (COD) / Pakistan Gateway Adapter](#cash-on-delivery-cod--pakistan-gateway-adapter)
    - [Admin Refund Workflow](#admin-refund-workflow)
12. [Testing](#12-testing)
13. [Deployment (Docker & Production Runner)](#13-deployment-docker--production-runner)
14. [Production Payment Activation Checklist](#14-production-payment-activation-checklist)
15. [Troubleshooting & FAQs](#15-troubleshooting--faqs)
16. [Security & Operational Limits](#16-security--operational-limits)

---

## 1. Architecture Overview

```
Electric-Bike Brand/
├── backend/
│   ├── src/
│   │   ├── app.ts                          # Express application factory & middleware stack
│   │   ├── server.ts                       # HTTP server bootstrap & graceful shutdown
│   │   ├── config/
│   │   │   ├── index.ts                    # Strongly-typed environment configuration
│   │   │   └── database.ts                 # MongoDB connection lifecycle management
│   │   ├── common/
│   │   │   ├── errors/                     # AppError hierarchy (NotFoundError, UnauthorizedError, etc.)
│   │   │   ├── middleware/                 # auth (JWT), validate (Zod), rateLimiter, errorHandler, requestId
│   │   │   └── utils/                      # Decimal.js monetary math, slugify, logger, retryWithBackoff
│   │   ├── database/
│   │   │   ├── models/                     # 15 Mongoose models with strict indexes & timestamps
│   │   │   └── seeds/                      # Seed script for products, categories, zones, admin
│   │   ├── docs/
│   │   │   └── swagger.ts                  # OpenAPI 3.0 Interactive Documentation
│   │   └── modules/
│   │       ├── health/                     # /api/v1/health probe (database ping)
│   │       ├── auth/                       # Register, login, refresh rotation, password reset, verify email
│   │       ├── users/                      # Profile, address book, customer order history
│   │       ├── products/                   # Catalog browsing, filtering, slug lookup, specs, variants
│   │       ├── categories/                 # Hierarchical vehicle & accessory categories
│   │       ├── cart/                       # Server-side price recalculation, guest & user carts
│   │       ├── checkout/                   # Authoritative price calculation, coupon validation, inventory reservation
│   │       ├── orders/                     # Order lifecycle, status history, customer self-cancellation
│   │       ├── inventory/                  # Atomic stock reservation, release, sale commit, ledger movements
│   │       ├── payments/                   # Provider interface, Stripe Checkout & Webhooks, COD provider, Refunds
│   │       ├── shipping/                   # Configurable zones, delivery fee calculation, pickup option
│   │       ├── coupons/                    # Percentage/fixed discounts, usage limits, user caps
│   │       ├── reviews/                    # Verified-purchase reviews, rating calculation, moderation
│   │       ├── wishlist/                   # Customer vehicle & accessory wishlist
│   │       ├── admin/                      # Order fulfillment transitions, dispatch tracking, customer status
│   │       ├── analytics/                  # Gross/net revenue, paid/unpaid metrics, best-sellers, low-stock
│   │       ├── audit/                      # Append-only immutable admin audit trail
│   │       └── notifications/              # Nodemailer transactional emails (verification, dispatch, refunds)
│   ├── tests/                              # Unit & integration test suites (Vitest)
│   ├── tsconfig.json                       # TypeScript compiler configuration (ES2022 / CommonJS)
│   └── vitest.config.ts                    # Test runner configuration
├── Dockerfile                              # Multi-stage production container build
├── docker-compose.yml                      # Production stack: API + MongoDB + Redis
├── package.json                            # Root dependency manifest & lifecycle scripts
└── .env.example                            # Complete environment variable template
```

---

## 2. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **MongoDB**: `v6.0` or `v7.0` (Community or MongoDB Atlas URI)
- **Redis** *(Optional)*: `v7.x` for distributed rate limiting and caching
- **Stripe Account** *(Optional for online payments)*: API keys from [Stripe Dashboard](https://dashboard.stripe.com)

---

## 3. Installation & Quick Start

```powershell
# 1. Clone or navigate to the project directory
cd "c:\Users\progr\Desktop\Electric-Bike Brand"

# 2. Install dependencies
npm install

# 3. Configure environment variables
Copy-Item .env.example .env

# 4. Verify TypeScript compilation
npm run typecheck

# 5. Run automated test suite
npm test

# 6. Seed initial vehicle catalog, categories, shipping zones, and admin account
npm run seed

# 7. Start development server with live reload
npm run dev
```

The API will be available at:
- **API Base**: `http://localhost:5000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:5000/api/docs`
- **Health Check Probe**: `http://localhost:5000/api/v1/health`

---

## 4. Environment Variables

All variables are configured via `.env` at the project root. Refer to `.env.example`:

| Variable | Description | Default / Example |
|---|---|---|
| `NODE_ENV` | Environment mode (`development`, `test`, `production`) | `development` |
| `PORT` | HTTP port | `5000` |
| `API_BASE_URL` | Base public URL of this API server | `http://localhost:5000` |
| `FRONTEND_URL` | Client storefront origin (for redirects & email links) | `http://localhost:3000` |
| `CORSED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:3000,http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection connection string | `mongodb://localhost:27017/evee_db` |
| `MONGODB_DB_NAME` | MongoDB database name | `evee_db` |
| `JWT_ACCESS_SECRET` | 64+ char secret for short-lived access tokens | *change in production* |
| `JWT_REFRESH_SECRET` | 64+ char secret for refresh tokens | *change in production* |
| `JWT_ACCESS_EXPIRY` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifespan | `7d` |
| `COOKIE_SECRET` | Secret for signed cookies | *change in production* |
| `PAYMENT_PROVIDER` | Active payment provider (`stripe` or `cod`) | `stripe` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) | `whsec_...` |
| `STRIPE_CURRENCY` | Default payment currency code | `pkr` |
| `STORE_CURRENCY` | Display currency code | `PKR` |
| `STORE_CURRENCY_SUBUNIT` | Currency subunit multiplier (1 PKR = 100 paisa) | `100` |
| `SMTP_HOST` | Transactional email SMTP host | `smtp.mailtrap.io` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` / `SMTP_PASS` | SMTP authentication credentials | |
| `SEED_ADMIN_EMAIL` | Default administrator email for seed script | `admin@evee.pk` |
| `SEED_ADMIN_PASSWORD` | Default administrator password for seed script | `Admin@EVee2024!` |

---

## 5. Database Design & MongoDB Configuration

All monetary values are strictly stored as **integers representing currency subunits (paisa/cents)**:
- Example: `285,000.00 PKR` is persisted as `28500000`.
- All financial calculations use `Decimal.js` to eliminate binary floating-point roundoff errors.

### Core Collections & Models:
1. **User (`User.model.ts`)**: Password hashes excluded by default (`select: false`), refresh token rotation with SHA-256 hashes, address book, email verification tokens.
2. **Product (`Product.model.ts`)**: Structured EV technical specifications (`battery_capacity`, `range`, `motor_power`, `top_speed`, `charging_time`), color variants with individual SKUs and delta pricing, text index for instant search.
3. **Category (`Category.model.ts`)**: Self-referencing tree structure supporting nested vehicle sub-categories.
4. **Cart (`Cart.model.ts`)**: Guest (session ID) and authenticated customer carts with automated TTL expiration.
5. **Order (`Order.model.ts`)**: Immutable snapshots of item names, SKUs, unit prices, and delivery addresses. Status history audit array.
6. **Payment (`Payment.model.ts`)**: Tracks gateway session IDs, payment intent IDs, charge IDs, refunded totals, and `processedEventIds[]` for idempotency.
7. **InventoryMovement (`InventoryMovement.model.ts`)**: Append-only immutable stock ledger recording movements (`sale`, `restock`, `adjustment`, `return`, `damage`) with before/after balances.
8. **AuditLog (`AuditLog.model.ts`)**: Complete administrative audit log for price updates, order status changes, and refunds.
9. **WebhookEvent (`WebhookEvent.model.ts`)**: Unique index on `{ provider, eventId }` preventing duplicate webhook event processing. 90-day TTL auto-cleanup.

---

## 6. Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts server with `tsx watch` for real-time live reload |
| `npm run build` | Compiles TypeScript into production JavaScript in `backend/dist` |
| `npm start` | Runs the compiled production server (`node backend/dist/server.js`) |
| `npm test` | Runs Vitest automated test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run typecheck` | Validates strict TypeScript compilation without emitting files |
| `npm run seed` | Seeds database with categories, vehicles, accessories, and admin user |

---

## 7. Database Seeding

Run the seed script to populate your database with Crown Motors vehicles and EV accessories:

```powershell
npm run seed
```

This populates:
- **Admin account**: `admin@evee.pk` / `Admin@EVee2024!` (configurable via `.env`)
- **Categories**: Electric Vehicles (Electric Motorcycles, Electric Scooters), EV Accessories
- **Vehicles**:
  - `EVee Pro 125`: Flagship motorcycle, 72V 45Ah graphene battery, 3000W motor, 120km range, color variants (Stealth Black, Electric Cyan)
  - `EVee City Commuter`: Urban electric scooter, 60V 32Ah battery, 1500W motor, 85km range, color variants (Pearl White, Slate Grey)
  - `EVee Fast Home Charger 15A`: Smart fast-charger with thermal protection
- **Shipping Zone**: Pakistan Nationwide (Carrier Transport, Showroom Pickup)
- **Promotional Coupons**: `EVEEFIRST` (10% off), `CROWN5000` (5,000 PKR off)

---

## 8. API Documentation (OpenAPI / Swagger)

Interactive API documentation is mounted at:
```
http://localhost:5000/api/docs
```
Raw OpenAPI JSON specification is available at:
```
http://localhost:5000/api/docs/json
```

---

## 9. Authentication Flow & Security

- **Dual-Token Architecture**: Short-lived JWT Access Token (`15m`) + Long-lived Refresh Token (`7d`).
- **HttpOnly Cookies**: Tokens are stored in HttpOnly, SameSite, Secure cookies to eliminate XSS token theft.
- **Refresh Token Rotation**: Refreshing a token revokes the previous token and issues a new pair. All tokens are stored hashed (SHA-256) in the database.
- **Timing Attack Defense**: Password comparison uses constant-time bcrypt operations, even for non-existent users.
- **Role-Based Access Control**: Strict `authenticate` and `authorize('admin')` middleware. Roles submitted by clients are rejected.
- **Rate Limiting**:
  - Auth endpoints (`/api/v1/auth/*`): 10 requests per 15 minutes
  - Checkout creation (`/api/v1/checkout/*`): 5 requests per minute
  - Search queries (`/api/v1/products/search`): 30 requests per minute
  - General API: 100 requests per minute

---

## 10. Checkout & Inventory Engine

### Strict Server-Side Authority
The backend **never trusts client-supplied prices, totals, taxes, or discounts**:
1. When checkout is initiated (`POST /api/v1/checkout/create-order`), the server queries the database for each product and variant.
2. The server calculates unit prices, discounts, shipping fees, and taxes.
3. Inventory is atomically reserved in MongoDB using conditional updates:
   ```typescript
   // Atomic reservation prevents overselling
   Product.updateOne(
     { _id: productId, $expr: { $gte: [{ $subtract: ['$inventory', '$reservedInventory'] }, qty] } },
     { $inc: { reservedInventory: qty } }
   );
   ```
4. If any item is out of stock, reservations are rolled back automatically.
5. Once payment is confirmed by a verified webhook, stock is permanently committed (`commitOrderInventory`), decrementing physical inventory, releasing the reservation, and recording an entry in `InventoryMovement`.
6. If the order is cancelled or payment fails, reservations are automatically released.

---

## 11. Payment Provider Architecture

The payment architecture utilizes a provider abstraction (`IPaymentProvider`):

```typescript
export interface IPaymentProvider {
  createCheckout(options: CreateCheckoutOptions): Promise<CheckoutSessionResult>;
  verifyWebhook(event: WebhookEventPayload): Promise<VerifiedWebhookEvent>;
  retrievePayment(paymentReference: string): Promise<{ status: string; amount: number; currency: string }>;
  refundPayment(options: RefundOptions): Promise<RefundResult>;
}
```

The active provider is chosen via `PAYMENT_PROVIDER` (`stripe` or `cod`), or requested on checkout.

### Stripe Checkout Integration
- Uses official `@stripe/stripe-node` SDK.
- Creates hosted Checkout Sessions with trusted line items calculated by the backend.
- Attaches `orderId` and `orderNumber` as session metadata.

### Stripe Webhook Signature Verification & Idempotency
- **Endpoint**: `POST /api/v1/payments/stripe/webhook`
- Built using `express.raw({ type: 'application/json' })` mounted **before** JSON body-parsing middleware.
- Verifies signature using `stripe.webhooks.constructEvent(rawBody, signature, secret)`.
- **Idempotency**: Checked against the `WebhookEvent` collection. Retried webhooks for previously processed event IDs return HTTP 200 immediately without duplicate inventory commits or duplicate order updates.
- Verifies payment amount matches the order's `grandTotal` before marking as `paid`.

### Cash on Delivery (COD) / Pakistan Gateway Adapter
For Crown Motors customers in Pakistan:
- Generates a verified internal session ID without requiring foreign merchant processing.
- Order is placed with `orderStatus: 'confirmed'` and `paymentStatus: 'pending'`.
- Dedicated admin endpoint: `POST /api/v1/admin/orders/:orderNumber/confirm-cod` after phone verification.

### Admin Refund Workflow
- Initiated via `POST /api/v1/payments/:orderNumber/refund`.
- Validates requested refund amount against remaining refundable balance.
- Calls payment provider's `refundPayment` method with an idempotency key.
- Updates Order and Payment records with verified provider refund ID.
- Automatically sends a refund email notification to the customer.
- Records an entry in `AuditLog`.

---

## 12. Testing

The backend includes comprehensive test suites powered by **Vitest**:

```powershell
npm test
```

### Test Coverage Highlights:
- **Monetary Math**: Decimal.js subunit conversions, precision checks, percentage discounts with caps, currency formatting.
- **Authentication**: Validation schemas, weak password rejection, case normalization, SHA-256 token hashing, JWT token signing/verification, tampered token rejection.
- **Checkout & Orders**: Order number format (`EVE-XXXX-XXXX`), item validation, discount capping logic, free shipping threshold calculations.
- **Payment Providers**: Stripe provider instantiation, COD checkout URL generation, COD refund handling, webhook signature absence handling.
- **Admin & Lifecycle**: Order status state machine (`pending_payment` -> `confirmed` -> `processing` -> `ready_to_ship` -> `shipped` -> `delivered`), tracking validation, stock restock/damage adjustment validation.

---

## 13. Deployment (Docker & Production Runner)

### Docker Deployment
The project includes a multi-stage `Dockerfile` and `docker-compose.yml`:

```bash
# Build and run the complete stack (API + MongoDB + Redis)
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop stack
docker-compose down
```

### Manual Linux / VPS Deployment
```bash
# 1. Build TypeScript
npm run build

# 2. Run with PM2 or systemd
pm2 start backend/dist/server.js --name "evee-api" -i max
pm2 save
```

---

## 14. Production Payment Activation Checklist

Before accepting real payments:
- [ ] Confirm legal business registration for Crown Motors.
- [ ] For Stripe: Ensure Crown Motors has an approved Stripe merchant account in an eligible country.
- [ ] Replace `sk_test_...` with live secret key `sk_live_...` in `.env`.
- [ ] Replace `pk_test_...` with live publishable key `pk_live_...`.
- [ ] In Stripe Dashboard, configure live webhook endpoint: `https://api.yourdomain.com/api/v1/payments/stripe/webhook`.
- [ ] Subscribe to events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
- [ ] Copy live webhook secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.
- [ ] Test real charge with a test card or minimal real transaction, verify webhook delivery, and test admin refund.
- [ ] Change all JWT secrets and Cookie secrets to unique 64+ random character strings.
- [ ] Change `SEED_ADMIN_PASSWORD` to a secure password.

---

## 15. Troubleshooting & FAQs

### Q: Why do I see "Stripe webhook signature verification failed"?
**A**: Ensure your reverse proxy (Nginx, Cloudflare) does not alter or re-serialize the request body for `/api/v1/payments/stripe/webhook`. The raw payload must match the byte-exact payload sent by Stripe.

### Q: Can I run this without Redis?
**A**: Yes. If `REDIS_URL` is omitted, the API automatically falls back to robust in-memory rate limiting.

### Q: How do I test Stripe webhooks locally?
**A**: Use the official Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/v1/payments/stripe/webhook
```
Copy the printed `whsec_...` secret to your `.env` file under `STRIPE_WEBHOOK_SECRET`.

---

## 16. Security & Operational Limits

- **Helmet**: Enforces HTTP security headers, CSP, and cross-origin policies.
- **NoSQL Injection**: Sanitized via `express-mongo-sanitize`.
- **CORS**: Restricted to configured origins (`CORSED_ORIGINS`).
- **Data Protection**: Password hashes, reset tokens, and refresh tokens are excluded from API responses by default. Full card details or CVVs are never handled or stored on the server.
- **Request Tracing**: Every incoming request is stamped with a unique `X-Request-ID` UUID for distributed tracing and structured log aggregation.

---

*EVee is an electric mobility brand operated by Crown Motors. Backend crafted for high availability, transactional integrity, and premium rider experiences.*

import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EVee E-Commerce API',
    version: '1.0.0',
    description:
      'Production-oriented e-commerce backend for EVee, premium electric mobility brand operated by Crown Motors. Powers electric motorcycle & scooter storefront, cart & checkout, Stripe & COD payments, inventory reservation, and secure admin operations.',
    contact: {
      name: 'Crown Motors Backend Engineering',
      email: 'support@evee.pk',
    },
  },
  servers: [
    {
      url: `${config.server.apiBaseUrl}/api/v1`,
      description: 'API v1 server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token or HttpOnly accessToken cookie',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
          meta: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Validation failed' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'EVee Pro 125' },
          slug: { type: 'string', example: 'evee-pro-125' },
          sku: { type: 'string', example: 'EVE-M125-PRO' },
          productType: { type: 'string', enum: ['motorcycle', 'scooter', 'accessory', 'part'] },
          basePrice: { type: 'integer', description: 'Price in smallest currency unit (paisa)', example: 28500000 },
          currency: { type: 'string', example: 'PKR' },
          images: { type: 'array', items: { type: 'string' } },
          specifications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                label: { type: 'string' },
                value: { type: 'string' },
                unit: { type: 'string' },
                group: { type: 'string' },
              },
            },
          },
          colorVariants: { type: 'array', items: { type: 'object' } },
          inventory: { type: 'integer', example: 25 },
          isActive: { type: 'boolean', example: true },
          isFeatured: { type: 'boolean', example: true },
          averageRating: { type: 'number', example: 4.8 },
          reviewCount: { type: 'integer', example: 14 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check',
        tags: ['System'],
        responses: {
          200: { description: 'API operational and DB connected' },
          533: { description: 'DB disconnected / degraded' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Customer Registration',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Bilal Khan' },
                  email: { type: 'string', format: 'email', example: 'bilal@example.com' },
                  password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
                  phone: { type: 'string', example: '+92-300-1234567' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Account created with tokens in HttpOnly cookies' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Customer & Admin Login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@evee.pk' },
                  password: { type: 'string', example: 'Admin@EVee2024!' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful with accessToken & refreshToken cookies' } },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout and Invalidate Session',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Cookies cleared and refresh token revoked' } },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get Authenticated User Profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Current user object without password hash' } },
      },
    },
    '/products': {
      get: {
        summary: 'Browse and Filter Product Catalog',
        tags: ['Products'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'productType', in: 'query', schema: { type: 'string', enum: ['motorcycle', 'scooter', 'accessory', 'part'] } },
          { name: 'minPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'popular', 'featured', 'rating'] } },
        ],
        responses: { 200: { description: 'Paginated product list' } },
      },
    },
    '/products/{slug}': {
      get: {
        summary: 'Get Product Details by URL Slug',
        tags: ['Products'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Full vehicle specs, color variants, pricing' } },
      },
    },
    '/cart': {
      get: {
        summary: 'Get Shopping Cart Summary',
        tags: ['Cart'],
        responses: { 200: { description: 'Cart items with server-verified prices and calculations' } },
      },
    },
    '/cart/items': {
      post: {
        summary: 'Add Item to Cart',
        tags: ['Cart'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  variantId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Item added with inventory validation' } },
      },
    },
    '/checkout/validate': {
      post: {
        summary: 'Validate Checkout Calculations',
        tags: ['Checkout'],
        description: 'Server recalculates all prices, applies coupons, computes shipping & tax without trusting client prices',
        responses: { 200: { description: 'Authoritative checkout calculations' } },
      },
    },
    '/checkout/create-order': {
      post: {
        summary: 'Create Order & Initiate Payment Flow',
        tags: ['Checkout'],
        description: 'Creates pending order, reserves inventory atomically, initiates Stripe Checkout Session or COD workflow',
        responses: { 201: { description: 'Returns orderNumber and checkoutUrl / payment instructions' } },
      },
    },
    '/orders/track/{orderNumber}': {
      get: {
        summary: 'Public Order Tracking',
        tags: ['Orders'],
        parameters: [
          { name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'email', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Fulfillment & shipment status' } },
      },
    },
    '/payments/stripe/webhook': {
      post: {
        summary: 'Stripe Webhook Listener',
        tags: ['Payments'],
        description: 'Raw body signature verification, processed event idempotency, inventory deduction & order confirmation',
        responses: { 200: { description: 'Webhook processed' } },
      },
    },
    '/admin/orders': {
      get: {
        summary: 'List & Filter All Orders',
        tags: ['Admin'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Admin order management' } },
      },
    },
    '/admin/inventory/adjust': {
      post: {
        summary: 'Manual Stock Adjustment with Audit Ledger',
        tags: ['Admin'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Inventory adjusted and ledger recorded' } },
      },
    },
    '/analytics/overview': {
      get: {
        summary: 'Store Sales & Analytics Overview',
        tags: ['Analytics'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Gross sales, net sales, refund totals, order metrics' } },
      },
    },
  },
};

export const swaggerRouter = Router();

swaggerRouter.get('/json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

swaggerRouter.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'EVee API Documentation — Crown Motors',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  })
);

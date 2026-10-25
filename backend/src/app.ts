import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { config } from './config';
import { requestIdMiddleware } from './common/middleware/requestId';
import { generalLimiter } from './common/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './common/middleware/errorHandler';
import { logger } from './common/utils/logger';

// Route imports (will be filled in as modules are built)
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { productRouter } from './modules/products/product.routes';
import { categoryRouter } from './modules/categories/category.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { checkoutRouter } from './modules/checkout/checkout.routes';
import { orderRouter } from './modules/orders/order.routes';
import { paymentRouter } from './modules/payments/payment.routes';
import { couponRouter } from './modules/coupons/coupon.routes';
import { reviewRouter } from './modules/reviews/review.routes';
import { wishlistRouter } from './modules/wishlist/wishlist.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { shippingRouter } from './modules/shipping/shipping.routes';
import { contactRouter } from './modules/contact/contact.routes';
import { uploadRouter } from './modules/upload/upload.routes';
import { swaggerRouter } from './docs/swagger';

export function createApp(): Application {
  const app = express();

  // Trust proxy (for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS
  app.use(cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        config.server.corsOrigins.includes('*') ||
        config.server.corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }));

  // Stripe webhook needs raw body BEFORE json middleware
  app.use('/api/v1/payments/stripe/webhook', express.raw({ type: 'application/json' }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  app.use(cookieParser(config.cookie.secret));

  // Compression
  app.use(compression());

  // NoSQL injection protection (Express 5 compatible)
  app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      mongoSanitize.sanitize(req.body);
    }
    if (req.params && typeof req.params === 'object') {
      mongoSanitize.sanitize(req.params);
    }
    next();
  });

  // Request ID
  app.use(requestIdMiddleware);

  // HTTP request logging
  if (!config.isTest) {
    app.use(morgan(config.isProduction ? 'combined' : 'dev', {
      stream: { write: (message: string) => logger.http(message.trim()) },
    }));
  }

  // Root & Diagnostics
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'EVee Crown Motors API',
      version: '1.0.0',
      status: 'online',
      endpoints: {
        health: '/api/v1/health',
        docs: '/api/docs',
      },
    });
  });

  app.get('/api', (_req, res) => {
    res.json({
      success: true,
      service: 'EVee Crown Motors API Gateway',
      version: '1.0.0',
    });
  });

  // General rate limiter
  app.use('/api/', generalLimiter);

  // Routes
  app.use('/api/v1', healthRouter);
  app.use('/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/checkout', checkoutRouter);
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/payments', paymentRouter);
  app.use('/api/v1/coupons', couponRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/shipping', shippingRouter);
  app.use('/api/v1/contact', contactRouter);
  app.use('/api/v1/upload', uploadRouter);

  // Dual alias for /api without v1 prefix
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/products', productRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/coupons', couponRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/shipping', shippingRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/docs', swaggerRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

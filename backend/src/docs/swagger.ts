import { Router, Request, Response } from 'express';

export const swaggerRouter = Router();

swaggerRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'EVee Crown Motors API Documentation',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      orders: '/api/v1/orders',
      cart: '/api/v1/cart',
      checkout: '/api/v1/checkout',
      upload: '/api/v1/upload',
    },
  });
});

swaggerRouter.get('/json', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: { title: 'EVee API', version: '1.0.0' },
  });
});

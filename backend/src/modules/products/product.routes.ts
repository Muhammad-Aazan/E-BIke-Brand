import { Router } from 'express';
import * as productController from './product.controller';
import { authenticate, authorize, optionalAuth } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { createProductSchema, updateProductSchema } from './product.validators';
import { searchLimiter } from '../../common/middleware/rateLimiter';

export const productRouter = Router();

productRouter.get('/', optionalAuth, productController.getProducts);
productRouter.get('/featured', productController.getFeaturedProducts);
productRouter.get('/search', searchLimiter, optionalAuth, productController.getProducts);
productRouter.get('/:id/related', productController.getRelatedProducts);
productRouter.get('/:slug', optionalAuth, productController.getProductBySlug);

// Admin only
productRouter.post('/', authenticate, authorize('admin'), validate(createProductSchema), productController.createProduct);
productRouter.patch('/:id', authenticate, authorize('admin'), validate(updateProductSchema), productController.updateProduct);
productRouter.patch('/:id/archive', authenticate, authorize('admin'), productController.archiveProduct);
productRouter.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

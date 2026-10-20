import { Router } from 'express';
import * as categoryController from './category.controller';
import { authenticate, authorize, optionalAuth } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { createCategorySchema, updateCategorySchema } from './category.validators';

export const categoryRouter = Router();

categoryRouter.get('/', optionalAuth, categoryController.getCategories);
categoryRouter.get('/:slug', categoryController.getCategoryBySlug);

// Admin only
categoryRouter.post('/', authenticate, authorize('admin'), validate(createCategorySchema), categoryController.createCategory);
categoryRouter.patch('/:id', authenticate, authorize('admin'), validate(updateCategorySchema), categoryController.updateCategory);
categoryRouter.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

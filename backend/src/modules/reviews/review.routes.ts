import { Router } from 'express';
import * as reviewController from './review.controller';
import { authenticate, authorize } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { createReviewSchema, moderateReviewSchema } from './review.validators';

export const reviewRouter = Router();

// Public: view approved product reviews
reviewRouter.get('/product/:productId', reviewController.getProductReviews);

// Customer: submit a review
reviewRouter.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);

// Admin: moderate review
reviewRouter.patch(
  '/:id/moderate',
  authenticate,
  authorize('admin'),
  validate(moderateReviewSchema),
  reviewController.moderateReview
);

// Admin or user delete review
reviewRouter.delete('/:id', authenticate, authorize('admin'), reviewController.deleteReview);

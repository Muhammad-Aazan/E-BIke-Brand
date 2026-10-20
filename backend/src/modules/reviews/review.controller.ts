import { Request, Response, NextFunction } from 'express';
import * as reviewService from './review.service';
import { successResponse } from '../../common/utils/response';

export async function getProductReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const result = await reviewService.getProductReviews(req.params.productId as string, page, limit);
    successResponse(res, { reviews: result.reviews }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const review = await reviewService.createReview(req.body, req.user!.userId);
    successResponse(res, { review }, { statusCode: 201, message: 'Review submitted' });
  } catch (err) {
    next(err);
  }
}

export async function moderateReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const review = await reviewService.moderateReview(req.params.id as string, req.body);
    successResponse(res, { review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await reviewService.deleteReview(req.params.id as string);
    successResponse(res, null, { message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}

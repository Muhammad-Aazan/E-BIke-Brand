import mongoose from 'mongoose';
import { Review, Product, Order, IReview } from '../../database/models';
import { NotFoundError, ConflictError } from '../../common/errors/AppError';
import { paginationMeta, PaginationMeta } from '../../common/utils/response';
import { CreateReviewInput, ModerateReviewInput } from './review.validators';

export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: IReview[]; meta: PaginationMeta }> {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ product: productId, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: productId, status: 'approved' }),
  ]);

  return { reviews, meta: paginationMeta(page, limit, total) };
}

export async function createReview(
  data: CreateReviewInput,
  userId: string
): Promise<IReview> {
  const product = await Product.findById(data.productId);
  if (!product) throw new NotFoundError('Product');

  // Verify unique review per user per product
  const existing = await Review.findOne({ product: data.productId, user: userId });
  if (existing) {
    throw new ConflictError('You have already reviewed this product');
  }

  // Check if verified purchase
  const verifiedOrder = await Order.findOne({
    user: userId,
    'items.product': data.productId,
    orderStatus: 'delivered',
  });

  const review = await Review.create({
    product: new mongoose.Types.ObjectId(data.productId),
    user: new mongoose.Types.ObjectId(userId),
    order: verifiedOrder ? verifiedOrder._id : undefined,
    rating: data.rating,
    title: data.title,
    body: data.body,
    isVerifiedPurchase: !!verifiedOrder,
    status: 'approved', // Auto-approve or queue for moderation
    reviewedAt: new Date(),
  } as any);

  await recalculateProductRating(data.productId);
  return review;
}

export async function moderateReview(
  reviewId: string,
  data: ModerateReviewInput
): Promise<IReview> {
  const review = await Review.findById(reviewId);
  if (!review) throw new NotFoundError('Review');

  review.status = data.status;
  review.adminNote = data.adminNote;
  await review.save();

  await recalculateProductRating(review.product.toString());
  return review;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) throw new NotFoundError('Review');
  await recalculateProductRating(review.product.toString());
}

async function recalculateProductRating(productId: string): Promise<void> {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          reviewCount: stats[0].reviewCount,
        },
      }
    );
  } else {
    await Product.updateOne(
      { _id: productId },
      { $set: { averageRating: 0, reviewCount: 0 } }
    );
  }
}

import mongoose from 'mongoose';
import { Coupon, CouponUsage, ICoupon } from '../../database/models';
import { NotFoundError, ConflictError, ValidationError } from '../../common/errors/AppError';
import { CreateCouponInput, UpdateCouponInput } from './coupon.validators';

export async function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string
): Promise<{
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  minimumOrderValue: number;
}> {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startsAt: { $lte: new Date() },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

  if (!coupon) {
    throw new ValidationError('Invalid or expired coupon code');
  }

  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    throw new ValidationError('Coupon usage limit reached');
  }

  if (userId && coupon.userUsageLimit > 0) {
    const usageCount = await CouponUsage.countDocuments({
      coupon: coupon._id,
      user: userId,
    });
    if (usageCount >= coupon.userUsageLimit) {
      throw new ValidationError('You have already reached the usage limit for this coupon');
    }
  }

  if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
    throw new ValidationError(
      `Coupon requires a minimum order value of ${coupon.minimumOrderValue}`
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.floor((subtotal * coupon.discountValue) / 100);
    if (coupon.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    minimumOrderValue: coupon.minimumOrderValue,
  };
}

export async function getCoupons(isAdmin = false): Promise<ICoupon[]> {
  const filter = isAdmin ? {} : { isActive: true };
  return Coupon.find(filter).sort({ createdAt: -1 });
}

export async function createCoupon(data: CreateCouponInput, adminUserId: string): Promise<ICoupon> {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new ConflictError('A coupon with this code already exists');
  }

  return Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
    applicableProducts: data.applicableProducts?.map((id) => new mongoose.Types.ObjectId(id)) || [],
    applicableCategories: data.applicableCategories?.map((id) => new mongoose.Types.ObjectId(id)) || [],
    createdBy: new mongoose.Types.ObjectId(adminUserId),
  } as any);
}

export async function updateCoupon(id: string, data: UpdateCouponInput): Promise<ICoupon> {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new NotFoundError('Coupon');

  if (data.code && data.code.toUpperCase() !== coupon.code) {
    const exists = await Coupon.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
    if (exists) throw new ConflictError('A coupon with this code already exists');
    coupon.code = data.code.toUpperCase();
  }

  const { code: _c, applicableProducts, applicableCategories, ...other } = data;
  if (applicableProducts) {
    coupon.applicableProducts = applicableProducts.map((p) => new mongoose.Types.ObjectId(p)) as any;
  }
  if (applicableCategories) {
    coupon.applicableCategories = applicableCategories.map((c) => new mongoose.Types.ObjectId(c)) as any;
  }

  Object.assign(coupon, other);
  return coupon.save();
}

export async function deleteCoupon(id: string): Promise<void> {
  const result = await Coupon.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Coupon');
}

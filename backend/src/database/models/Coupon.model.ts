import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (0-100) or fixed subunits
  minimumOrderValue: number; // subunits, 0 = no minimum
  maximumDiscountAmount?: number; // cap for percentage discounts, subunits
  usageLimit: number;  // 0 = unlimited
  usageCount: number;
  userUsageLimit: number; // per-user limit, 0 = unlimited
  applicableProducts: mongoose.Types.ObjectId[]; // empty = all
  applicableCategories: mongoose.Types.ObjectId[]; // empty = all
  restrictedUsers: mongoose.Types.ObjectId[]; // empty = all users
  startsAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9_-]{3,30}$/, 'Invalid coupon code format'],
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: { type: Number, required: true, min: 0 },
  minimumOrderValue: { type: Number, default: 0, min: 0 },
  maximumDiscountAmount: { type: Number, min: 0 },
  usageLimit: { type: Number, default: 0, min: 0 },
  usageCount: { type: Number, default: 0, min: 0 },
  userUsageLimit: { type: Number, default: 1, min: 0 },
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  restrictedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startsAt: { type: Date, required: true },
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

couponSchema.set('toJSON', { versionKey: false });

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', couponSchema);

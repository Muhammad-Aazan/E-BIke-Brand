import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICouponUsage extends Document {
  coupon: mongoose.Types.ObjectId;
  couponCode: string;
  user?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  discountAmount: number; // subunits
  createdAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsage>({
  coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
  couponCode: { type: String, required: true, uppercase: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  discountAmount: { type: Number, required: true, min: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });

couponUsageSchema.index({ coupon: 1 });
couponUsageSchema.index({ user: 1, coupon: 1 }, { sparse: true });
couponUsageSchema.index({ orderNumber: 1 });

const CouponUsage: Model<ICouponUsage> = mongoose.model<ICouponUsage>('CouponUsage', couponUsageSchema);
export { CouponUsage };

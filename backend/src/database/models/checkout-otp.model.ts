import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICheckoutOtp extends Document {
  email: string;
  otp: string;
  verificationToken?: string;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutOtpSchema = new Schema<ICheckoutOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

checkoutOtpSchema.index({ email: 1, isVerified: 1 });
checkoutOtpSchema.index({ verificationToken: 1 });

export const CheckoutOtp: Model<ICheckoutOtp> = mongoose.model<ICheckoutOtp>(
  'CheckoutOtp',
  checkoutOtpSchema
);

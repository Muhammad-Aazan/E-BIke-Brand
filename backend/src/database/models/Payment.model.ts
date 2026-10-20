import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRefund {
  refundId: string; // provider refund ID
  amount: number;   // subunits
  reason?: string;
  status: 'pending' | 'succeeded' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  requestedBy?: mongoose.Types.ObjectId;
}

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  provider: 'stripe' | 'cod' | 'bank_transfer';
  providerSessionId?: string;   // Stripe checkout session ID
  providerPaymentIntentId?: string; // Stripe payment intent ID
  providerChargeId?: string;
  amount: number;    // subunits
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  refunds: IRefund[];
  refundedTotal: number; // subunits
  processedEventIds: string[]; // for idempotency
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>({
  refundId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: String,
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  requestedAt: { type: Date, required: true },
  processedAt: Date,
  requestedBy: Schema.Types.ObjectId,
}, { _id: false });

const paymentSchema = new Schema<IPayment>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  provider: { type: String, enum: ['stripe', 'cod', 'bank_transfer'], required: true },
  providerSessionId: String,
  providerPaymentIntentId: String,
  providerChargeId: String,
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  refunds: [refundSchema],
  refundedTotal: { type: Number, default: 0, min: 0 },
  processedEventIds: [String],
  metadata: Schema.Types.Mixed,
  paidAt: Date,
  failedAt: Date,
  failureReason: String,
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ orderNumber: 1 });
paymentSchema.index({ providerSessionId: 1 }, { sparse: true });
paymentSchema.index({ providerPaymentIntentId: 1 }, { sparse: true });
paymentSchema.index({ processedEventIds: 1 });

paymentSchema.set('toJSON', { versionKey: false });

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

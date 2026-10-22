import mongoose, { Document, Schema, Model } from 'mongoose';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'partially_refunded'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  productName: string; // immutable snapshot
  sku: string;         // immutable snapshot
  variantName?: string;
  variantColorHex?: string;
  image?: string;
  quantity: number;
  unitPrice: number; // in subunits, immutable snapshot
  totalPrice: number; // quantity * unitPrice, in subunits
}

export interface IAddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  // Guest checkout
  guestEmail?: string;
  guestName?: string;
  items: IOrderItem[];
  shippingAddress: IAddressSnapshot;
  billingAddress?: IAddressSnapshot;
  subtotal: number;       // sum of item totals, subunits
  discountAmount: number; // subunits
  couponCode?: string;
  shippingFee: number;    // subunits
  taxAmount: number;      // subunits
  grandTotal: number;     // subunits
  currency: string;
  paymentProvider: 'stripe' | 'cod' | 'bank_transfer';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference?: string;  // Stripe checkout session ID etc.
  stripePaymentIntentId?: string;
  shippingMethod?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundedAmount: number; // subunits
  notes?: string; // admin notes
  customerNotes?: string;
  metadata?: Record<string, unknown>;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    updatedBy?: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: Schema.Types.ObjectId,
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  variantName: String,
  variantColorHex: String,
  image: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const addressSnapshotSchema = new Schema<IAddressSnapshot>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: String,
  country: { type: String, required: true, default: 'PK' },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  guestEmail: String,
  guestName: String,
  items: { type: [orderItemSchema], required: true },
  shippingAddress: { type: addressSnapshotSchema, required: true },
  billingAddress: addressSnapshotSchema,
  subtotal: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  couponCode: String,
  shippingFee: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'cod', 'bank_transfer'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: [
      'pending_payment', 'confirmed', 'processing',
      'ready_to_ship', 'shipped', 'delivered',
      'cancelled', 'partially_refunded', 'refunded',
    ],
    default: 'pending_payment',
  },
  paymentReference: String,
  stripePaymentIntentId: String,
  shippingMethod: String,
  shippingCarrier: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  refundedAmount: { type: Number, default: 0, min: 0 },
  notes: String,
  customerNotes: String,
  metadata: Schema.Types.Mixed,
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, required: true },
    note: String,
    updatedBy: Schema.Types.ObjectId,
  }],
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentReference: 1 }, { sparse: true });
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
orderSchema.index({ guestEmail: 1 }, { sparse: true });
orderSchema.index({ createdAt: -1 });

orderSchema.set('toJSON', { versionKey: false });

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);

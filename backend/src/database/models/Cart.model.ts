import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
  // Snapshot fields (updated at add time, refreshed on cart load)
  productName: string;
  sku: string;
  unitPrice: number; // in subunits, always from DB
  variantName?: string;
  variantColorHex?: string;
  image?: string;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string; // for guest carts
  items: ICartItem[];
  couponCode?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: Schema.Types.ObjectId,
  quantity: { type: Number, required: true, min: 1, max: 999 },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  variantName: String,
  variantColorHex: String,
  image: String,
}, { _id: true });

const cartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  sessionId: { type: String, sparse: true },
  items: { type: [cartItemSchema], default: [] },
  couponCode: String,
  expiresAt: { type: Date },
}, { timestamps: true });

cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

cartSchema.set('toJSON', { versionKey: false });

export const Cart: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);

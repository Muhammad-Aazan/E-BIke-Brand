import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISpecification {
  key: string;
  label: string;
  value: string;
  unit?: string;
  group?: string; // e.g. 'Performance', 'Battery', 'Dimensions'
}

export interface IColorVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  colorHex: string;
  images: string[];
  sku: string;
  additionalPrice: number; // in subunits
  inventory: number;
  reservedInventory: number;
  isActive: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  productType: 'motorcycle' | 'scooter' | 'accessory' | 'part';
  basePrice: number; // in subunits (paisa)
  compareAtPrice?: number; // in subunits
  currency: string;
  images: string[];
  specifications: ISpecification[];
  colorVariants: IColorVariant[];
  inventory: number; // base inventory (no variant)
  reservedInventory: number;
  inventoryPolicy: 'track' | 'preorder' | 'unlimited';
  weight?: number; // grams
  dimensions?: { length: number; width: number; height: number };
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const specificationSchema = new Schema<ISpecification>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  unit: String,
  group: { type: String, default: 'General' },
}, { _id: false });

const colorVariantSchema = new Schema<IColorVariant>({
  name: { type: String, required: true },
  colorHex: { type: String, required: true },
  images: [String],
  sku: { type: String, required: true },
  additionalPrice: { type: Number, default: 0 },
  inventory: { type: Number, default: 0, min: 0 },
  reservedInventory: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, { _id: true });

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, required: true },
  shortDescription: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: 'EVee', trim: true },
  productType: {
    type: String,
    enum: ['motorcycle', 'scooter', 'accessory', 'part'],
    required: true,
  },
  basePrice: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  currency: { type: String, default: 'PKR' },
  images: [String],
  specifications: [specificationSchema],
  colorVariants: [colorVariantSchema],
  inventory: { type: Number, default: 0, min: 0 },
  reservedInventory: { type: Number, default: 0, min: 0 },
  inventoryPolicy: {
    type: String,
    enum: ['track', 'preorder', 'unlimited'],
    default: 'track',
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  soldCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

// Indexes
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ productType: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }, {
  weights: { name: 3, tags: 2, description: 1 },
  name: 'product_text_index',
});
productSchema.index({ 'colorVariants.sku': 1 });

productSchema.set('toJSON', { versionKey: false });

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

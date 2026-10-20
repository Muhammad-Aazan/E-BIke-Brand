import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IShippingMethod {
  name: string;
  description?: string;
  price: number; // subunits
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  restrictions?: {
    maxWeight?: number; // grams
    productTypes?: string[];
    requiresPickup?: boolean;
  };
}

export interface IShippingZone extends Document {
  name: string;
  description?: string;
  countries: string[]; // ISO country codes
  cities?: string[];
  methods: IShippingMethod[];
  freeShippingThreshold?: number; // subunits, 0 = no free shipping
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shippingMethodSchema = new Schema<IShippingMethod>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  estimatedDaysMin: { type: Number, required: true, min: 0 },
  estimatedDaysMax: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
  restrictions: {
    maxWeight: Number,
    productTypes: [String],
    requiresPickup: Boolean,
  },
}, { _id: false });

const shippingZoneSchema = new Schema<IShippingZone>({
  name: { type: String, required: true, trim: true },
  description: String,
  countries: [{ type: String, required: true }],
  cities: [String],
  methods: [shippingMethodSchema],
  freeShippingThreshold: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

shippingZoneSchema.index({ countries: 1, isActive: 1 });

shippingZoneSchema.set('toJSON', { versionKey: false });

export const ShippingZone: Model<IShippingZone> = mongoose.model<IShippingZone>('ShippingZone', shippingZoneSchema);

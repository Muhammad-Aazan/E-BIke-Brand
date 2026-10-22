import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string; // home, work, etc.
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin' | 'support';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  refreshTokens: Array<{
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }>;
  addresses: IAddress[];
  accountStatus: 'active' | 'suspended' | 'deleted';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  label: { type: String, default: 'home', trim: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, required: true, default: 'PK' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const refreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  userAgent: String,
  ipAddress: String,
}, { _id: false });

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
  },
  normalizedEmail: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String, trim: true },
  avatarUrl: { type: String, trim: true },
  role: {
    type: String,
    enum: ['customer', 'admin', 'support'],
    default: 'customer',
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpiry: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpiry: { type: Date, select: false },
  refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
  addresses: { type: [addressSchema], default: [] },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },
  lastLoginAt: Date,
}, { timestamps: true });

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ 'refreshTokens.tokenHash': 1 });

// Never return passwordHash by default
userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpiry;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpiry;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

import mongoose, { Document, Schema, Model } from 'mongoose';

export type MovementType =
  | 'sale'
  | 'restock'
  | 'adjustment'
  | 'reservation'
  | 'reservation_release'
  | 'return'
  | 'damage';

export interface IInventoryMovement extends Document {
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  sku: string;
  movementType: MovementType;
  quantity: number; // positive = in, negative = out
  balanceBefore: number;
  balanceAfter: number;
  reference?: string; // order number, etc.
  note?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const inventoryMovementSchema = new Schema<IInventoryMovement>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: Schema.Types.ObjectId,
  sku: { type: String, required: true },
  movementType: {
    type: String,
    enum: ['sale', 'restock', 'adjustment', 'reservation', 'reservation_release', 'return', 'damage'],
    required: true,
  },
  quantity: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  reference: String,
  note: String,
  performedBy: Schema.Types.ObjectId,
}, { timestamps: { createdAt: true, updatedAt: false } });

inventoryMovementSchema.index({ product: 1, createdAt: -1 });
inventoryMovementSchema.index({ sku: 1, createdAt: -1 });
inventoryMovementSchema.index({ reference: 1 }, { sparse: true });

const InventoryMovement: Model<IInventoryMovement> = mongoose.model<IInventoryMovement>('InventoryMovement', inventoryMovementSchema);
export { InventoryMovement };

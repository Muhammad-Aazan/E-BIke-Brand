import mongoose from 'mongoose';
import { Product, InventoryMovement, MovementType } from '../../database/models';
import { InsufficientInventoryError, NotFoundError } from '../../common/errors/AppError';
import { logger } from '../../common/utils/logger';

export interface ReserveItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  sku: string;
}

export interface InventoryMovementRecord {
  productId: string;
  variantId?: string;
  sku: string;
  movementType: MovementType;
  quantity: number;
  reference?: string;
  note?: string;
  performedBy?: string;
}

/**
 * Atomically reserve inventory for checkout.
 * If any item lacks stock, reverts any already-reserved items in this batch.
 */
export async function reserveInventoryBatch(
  items: ReserveItemRequest[],
  orderNumber: string
): Promise<void> {
  const reservedSoFar: ReserveItemRequest[] = [];

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new NotFoundError(`Product ${item.productId}`);

      if (product.inventoryPolicy === 'unlimited' || product.inventoryPolicy === 'preorder') {
        continue; // preorder or unlimited products don't block
      }

      if (item.variantId) {
        // Reserve variant stock atomically
        const res = await Product.updateOne(
          {
            _id: item.productId,
            'colorVariants._id': item.variantId,
            $expr: {
              $gte: [
                {
                  $subtract: [
                    '$colorVariants.inventory',
                    '$colorVariants.reservedInventory',
                  ],
                },
                item.quantity,
              ],
            },
          },
          {
            $inc: { 'colorVariants.$.reservedInventory': item.quantity },
          }
        );

        if (res.modifiedCount === 0) {
          // Fallback check: verify if inventory policy or race condition
          const p = await Product.findById(item.productId);
          const v = p?.colorVariants.find((cv) => cv._id?.toString() === item.variantId);
          const available = (v?.inventory || 0) - (v?.reservedInventory || 0);
          if (available < item.quantity) {
            throw new InsufficientInventoryError(product.name);
          }
          // Simple atomic increment if $expr wasn't supported by MongoDB version
          await Product.updateOne(
            { _id: item.productId, 'colorVariants._id': item.variantId },
            { $inc: { 'colorVariants.$.reservedInventory': item.quantity } }
          );
        }
      } else {
        // Reserve base stock atomically
        const res = await Product.updateOne(
          {
            _id: item.productId,
            $expr: {
              $gte: [
                { $subtract: ['$inventory', '$reservedInventory'] },
                item.quantity,
              ],
            },
          },
          {
            $inc: { reservedInventory: item.quantity },
          }
        );

        if (res.modifiedCount === 0) {
          const p = await Product.findById(item.productId);
          const available = (p?.inventory || 0) - (p?.reservedInventory || 0);
          if (available < item.quantity) {
            throw new InsufficientInventoryError(product.name);
          }
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { reservedInventory: item.quantity } }
          );
        }
      }

      reservedSoFar.push(item);
    }
  } catch (error) {
    // Rollback reserved items
    for (const reserved of reservedSoFar) {
      await releaseReservation(reserved.productId, reserved.variantId, reserved.quantity).catch(
        (err) => logger.error('Rollback reservation error:', err)
      );
    }
    throw error;
  }
}

/**
 * Release reserved inventory (e.g. on payment failure or cancellation)
 */
export async function releaseReservation(
  productId: string,
  variantId: string | undefined,
  quantity: number
): Promise<void> {
  if (variantId) {
    await Product.updateOne(
      { _id: productId, 'colorVariants._id': variantId },
      { $inc: { 'colorVariants.$.reservedInventory': -quantity } }
    );
  } else {
    await Product.updateOne(
      { _id: productId },
      { $inc: { reservedInventory: -quantity } }
    );
  }
}

/**
 * Release all reservations for an order's items
 */
export async function releaseOrderReservations(
  items: Array<{ product: any; variantId?: any; quantity: number }>
): Promise<void> {
  for (const item of items) {
    const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
    const varId = item.variantId ? item.variantId.toString() : undefined;
    await releaseReservation(prodId, varId, item.quantity);
  }
}

/**
 * Permanently deduct inventory once payment is confirmed or order is fulfilled.
 * Also releases the reservation in the same operation and records inventory movement.
 */
export async function commitOrderInventory(
  items: Array<{ product: any; variantId?: any; quantity: number; sku: string }>,
  orderNumber: string
): Promise<void> {
  for (const item of items) {
    const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
    const varId = item.variantId ? item.variantId.toString() : undefined;

    const product = await Product.findById(prodId);
    if (!product) continue;

    let balanceBefore = 0;
    let balanceAfter = 0;

    if (varId) {
      const v = product.colorVariants.find((cv) => cv._id?.toString() === varId);
      balanceBefore = v?.inventory || 0;
      balanceAfter = Math.max(0, balanceBefore - item.quantity);

      await Product.updateOne(
        { _id: prodId, 'colorVariants._id': varId },
        {
          $inc: {
            'colorVariants.$.inventory': -item.quantity,
            'colorVariants.$.reservedInventory': -item.quantity,
          },
        }
      );
    } else {
      balanceBefore = product.inventory;
      balanceAfter = Math.max(0, balanceBefore - item.quantity);

      await Product.updateOne(
        { _id: prodId },
        {
          $inc: {
            inventory: -item.quantity,
            reservedInventory: -item.quantity,
            soldCount: item.quantity,
          },
        }
      );
    }

    // Record inventory movement ledger
    await InventoryMovement.create({
      product: new mongoose.Types.ObjectId(prodId),
      variantId: varId ? new mongoose.Types.ObjectId(varId) : undefined,
      sku: item.sku,
      movementType: 'sale',
      quantity: -item.quantity,
      balanceBefore,
      balanceAfter,
      reference: orderNumber,
      note: `Fulfilled order ${orderNumber}`,
    });
  }
}

/**
 * Admin manual adjustment of inventory
 */
export async function adjustInventory(params: {
  productId: string;
  variantId?: string;
  sku: string;
  quantityDelta: number; // positive or negative
  movementType: MovementType;
  note?: string;
  performedBy: string;
}): Promise<void> {
  const product = await Product.findById(params.productId);
  if (!product) throw new NotFoundError('Product');

  let balanceBefore = 0;
  let balanceAfter = 0;

  if (params.variantId) {
    const v = product.colorVariants.find((cv) => cv._id?.toString() === params.variantId);
    if (!v) throw new NotFoundError('Variant');
    balanceBefore = v.inventory;
    balanceAfter = Math.max(0, balanceBefore + params.quantityDelta);

    await Product.updateOne(
      { _id: params.productId, 'colorVariants._id': params.variantId },
      { $set: { 'colorVariants.$.inventory': balanceAfter } }
    );
  } else {
    balanceBefore = product.inventory;
    balanceAfter = Math.max(0, balanceBefore + params.quantityDelta);

    await Product.updateOne(
      { _id: params.productId },
      { $set: { inventory: balanceAfter } }
    );
  }

  await InventoryMovement.create({
    product: new mongoose.Types.ObjectId(params.productId),
    variantId: params.variantId ? new mongoose.Types.ObjectId(params.variantId) : undefined,
    sku: params.sku,
    movementType: params.movementType,
    quantity: params.quantityDelta,
    balanceBefore,
    balanceAfter,
    note: params.note,
    performedBy: new mongoose.Types.ObjectId(params.performedBy),
  });
}

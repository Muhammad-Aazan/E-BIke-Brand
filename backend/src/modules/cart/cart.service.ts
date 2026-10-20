import mongoose from 'mongoose';
import { Cart, Product, Coupon, ICart, ICartItem } from '../../database/models';
import { NotFoundError, AppError, InsufficientInventoryError } from '../../common/errors/AppError';
import { addSubunit } from '../../common/utils/decimal';

export async function getOrCreateCart(userId?: string, sessionId?: string): Promise<ICart> {
  if (!userId && !sessionId) throw new AppError('Cart identifier required', 400);

  const filter = userId ? { user: new mongoose.Types.ObjectId(userId) } : { sessionId };
  let cart = await Cart.findOne(filter);

  if (!cart) {
    cart = await Cart.create({
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      sessionId: userId ? undefined : sessionId,
      items: [],
    });
  }

  return cart;
}

export async function refreshCartPrices(cart: ICart): Promise<ICart> {
  const productIds = [...new Set(cart.items.map((i) => i.product.toString()))];
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const validItems: ICartItem[] = [];
  for (const item of cart.items) {
    const product = productMap.get(item.product.toString());
    if (!product) continue; // product no longer active/available

    let unitPrice = product.basePrice;
    let variantName: string | undefined;
    let variantColorHex: string | undefined;
    let image = product.images[0];
    let sku = product.sku;

    if (item.variantId) {
      const variant = product.colorVariants.find(
        (v) => v._id?.toString() === item.variantId?.toString()
      );
      if (variant && variant.isActive) {
        unitPrice = addSubunit(product.basePrice, variant.additionalPrice);
        variantName = variant.name;
        variantColorHex = variant.colorHex;
        image = variant.images[0] || image;
        sku = variant.sku;
      }
    }

    const itemObj = (item as any).toObject ? (item as any).toObject() : item;
    validItems.push({
      ...itemObj,
      productName: product.name,
      sku,
      unitPrice,
      variantName,
      variantColorHex,
      image,
    } as ICartItem);
  }

  cart.items = validItems;
  return cart;
}

export async function addItem(
  userId: string | undefined,
  sessionId: string | undefined,
  productId: string,
  variantId: string | undefined,
  quantity: number
): Promise<ICart> {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new NotFoundError('Product');

  let unitPrice = product.basePrice;
  let variantName: string | undefined;
  let variantColorHex: string | undefined;
  let sku = product.sku;
  let image = product.images[0];

  if (variantId) {
    const variant = product.colorVariants.find((v) => v._id?.toString() === variantId);
    if (!variant || !variant.isActive) throw new NotFoundError('Product variant');
    unitPrice = addSubunit(product.basePrice, variant.additionalPrice);
    variantName = variant.name;
    variantColorHex = variant.colorHex;
    sku = variant.sku;
    image = variant.images[0] || image;
  }

  // Check inventory
  if (product.inventoryPolicy === 'track') {
    const available = variantId
      ? (product.colorVariants.find((v) => v._id?.toString() === variantId)?.inventory || 0) -
        (product.colorVariants.find((v) => v._id?.toString() === variantId)?.reservedInventory || 0)
      : product.inventory - product.reservedInventory;

    if (available < quantity) throw new InsufficientInventoryError(product.name);
  }

  const cart = await getOrCreateCart(userId, sessionId);

  const existingItemIdx = cart.items.findIndex(
    (i) =>
      i.product.toString() === productId &&
      (variantId ? i.variantId?.toString() === variantId : !i.variantId)
  );

  if (existingItemIdx >= 0) {
    cart.items[existingItemIdx].quantity += quantity;
    cart.items[existingItemIdx].unitPrice = unitPrice;
  } else {
    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      variantId: variantId ? new mongoose.Types.ObjectId(variantId) : undefined,
      quantity,
      productName: product.name,
      sku,
      unitPrice,
      variantName,
      variantColorHex,
      image,
    } as any);
  }

  return cart.save();
}

export async function updateItem(
  userId: string | undefined,
  sessionId: string | undefined,
  itemId: string,
  quantity: number
): Promise<ICart> {
  const cart = await getOrCreateCart(userId, sessionId);
  const itemIdx = cart.items.findIndex((i) => i._id?.toString() === itemId);
  if (itemIdx < 0) throw new NotFoundError('Cart item');

  if (quantity === 0) {
    cart.items.splice(itemIdx, 1);
  } else {
    cart.items[itemIdx].quantity = quantity;
  }

  return cart.save();
}

export async function removeItem(
  userId: string | undefined,
  sessionId: string | undefined,
  itemId: string
): Promise<ICart> {
  const cart = await getOrCreateCart(userId, sessionId);
  const itemIdx = cart.items.findIndex((i) => i._id?.toString() === itemId);
  if (itemIdx < 0) throw new NotFoundError('Cart item');
  cart.items.splice(itemIdx, 1);
  return cart.save();
}

export async function clearCart(
  userId: string | undefined,
  sessionId: string | undefined
): Promise<void> {
  const cart = await getOrCreateCart(userId, sessionId);
  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();
}

export async function getCartSummary(
  cart: ICart,
  couponCode?: string
): Promise<{
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  estimatedTotal: number;
}> {
  const refreshed = await refreshCartPrices(cart);
  let subtotal = 0;
  for (const item of refreshed.items) {
    subtotal = addSubunit(subtotal, item.unitPrice * item.quantity);
  }

  let discountAmount = 0;
  let appliedCoupon: string | undefined;

  const code = couponCode || cart.couponCode;
  if (code) {
    try {
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startsAt: { $lte: new Date() },
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      });

      if (coupon) {
        if (coupon.minimumOrderValue === 0 || subtotal >= coupon.minimumOrderValue) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.floor((subtotal * coupon.discountValue) / 100);
            if (coupon.maximumDiscountAmount) {
              discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
            }
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
          appliedCoupon = coupon.code;
        }
      }
    } catch {
      // ignore invalid coupon for cart summary
    }
  }

  return {
    items: refreshed.items,
    subtotal,
    discountAmount,
    couponCode: appliedCoupon,
    estimatedTotal: Math.max(0, subtotal - discountAmount),
  };
}

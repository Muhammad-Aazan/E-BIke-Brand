import mongoose from 'mongoose';
import crypto from 'crypto';
import {
  Product,
  Order,
  Payment,
  Coupon,
  CouponUsage,
  ShippingZone,
  CheckoutOtp,
  IOrderItem,
  IOrder,
} from '../../database/models';
import {
  NotFoundError,
  InsufficientInventoryError,
  ValidationError,
} from '../../common/errors/AppError';
import { generateOrderNumber } from '../../common/utils/slugify';
import { addSubunit } from '../../common/utils/decimal';
import { reserveInventoryBatch } from '../inventory/inventory.service';
import { getPaymentProvider } from '../payments/providers';
import { sendCheckoutOtpEmail } from '../notifications/email.service';
import { logger } from '../../common/utils/logger';
import { config } from '../../config';
import {
  CreateOrderInput,
  ValidateCheckoutInput,
  SendCheckoutOtpInput,
  VerifyCheckoutOtpInput,
} from './checkout.validators';

export interface CalculatedCheckout {
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
}

/**
 * Send 6-digit OTP code to verify customer email for vehicle checkout.
 */
export async function sendCheckoutOtp(input: SendCheckoutOtpInput): Promise<{
  success: boolean;
  message: string;
  testOtp?: string;
}> {
  const normalizedEmail = input.email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert active OTP for email
  await CheckoutOtp.deleteMany({ email: normalizedEmail });
  await CheckoutOtp.create({
    email: normalizedEmail,
    otp,
    expiresAt,
    isVerified: false,
  });

  logger.info(`[CHECKOUT OTP] Verification code generated for ${normalizedEmail}: ${otp}`);

  // Dispatch email notification
  try {
    await sendCheckoutOtpEmail(normalizedEmail, input.fullName || 'Customer', otp);
    logger.info(`[CHECKOUT OTP] Verification email dispatched to ${normalizedEmail}`);
  } catch (err: any) {
    logger.warn(`[CHECKOUT OTP] SMTP dispatch skipped or failed (${err.message}). Code logged to console: ${otp}`);
  }

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}. Valid for 10 minutes.`,
    testOtp: config.isDevelopment ? otp : undefined,
  };
}

/**
 * Verify OTP entered by customer during vehicle checkout.
 */
export async function verifyCheckoutOtp(input: VerifyCheckoutOtpInput): Promise<{
  verified: boolean;
  verificationToken: string;
  email: string;
  message: string;
}> {
  const normalizedEmail = input.email.toLowerCase().trim();

  const record = await CheckoutOtp.findOne({
    email: normalizedEmail,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new ValidationError('Verification code has expired or was not requested. Please request a new code.');
  }

  if (record.otp !== input.code.trim()) {
    throw new ValidationError('Invalid 6-digit verification code. Please check and try again.');
  }

  const verificationToken = 'vtok_' + crypto.randomBytes(24).toString('hex');
  record.isVerified = true;
  record.verificationToken = verificationToken;
  await record.save();

  logger.info(`[CHECKOUT OTP] Email ${normalizedEmail} successfully verified with token ${verificationToken}`);

  return {
    verified: true,
    verificationToken,
    email: normalizedEmail,
    message: 'Email address verified successfully.',
  };
}

/**
 * Re-validates items, recalculates prices, validates coupons and calculates taxes/shipping.
 * Server is the sole authority on all monetary values.
 */
export async function calculateCheckout(
  input: ValidateCheckoutInput,
  userId?: string
): Promise<CalculatedCheckout> {
  const calculatedItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const itemInput of input.items) {
    let product;
    if (mongoose.isValidObjectId(itemInput.productId)) {
      product = await Product.findById(itemInput.productId);
    }
    if (!product) {
      const cleanSlug = itemInput.productId.replace(/^seed-/, '');
      product = await Product.findOne({
        $or: [{ slug: cleanSlug }, { sku: itemInput.productId }],
      });
    }

    if (!product || !product.isActive) {
      throw new NotFoundError(`Product '${itemInput.productId}' not found or unavailable`);
    }

    let unitPrice = product.basePrice;
    let variantName: string | undefined;
    let variantColorHex: string | undefined;
    let sku = product.sku;
    let image = product.images[0];

    if (itemInput.variantId) {
      const variant = product.colorVariants.find(
        (v) => v._id?.toString() === itemInput.variantId
      );
      if (!variant || !variant.isActive) {
        throw new NotFoundError(`Product color variant not found`);
      }
      unitPrice = addSubunit(product.basePrice, variant.additionalPrice);
      variantName = variant.name;
      variantColorHex = variant.colorHex;
      sku = variant.sku;
      image = variant.images[0] || image;

      if (product.inventoryPolicy === 'track') {
        const available = variant.inventory - variant.reservedInventory;
        if (available < itemInput.quantity) {
          throw new InsufficientInventoryError(`${product.name} (${variant.name})`);
        }
      }
    } else {
      if (product.inventoryPolicy === 'track') {
        const available = product.inventory - product.reservedInventory;
        if (available < itemInput.quantity) {
          throw new InsufficientInventoryError(product.name);
        }
      }
    }

    const totalPrice = unitPrice * itemInput.quantity;
    subtotal = addSubunit(subtotal, totalPrice);

    calculatedItems.push({
      product: product._id as any,
      variantId: itemInput.variantId ? new mongoose.Types.ObjectId(itemInput.variantId) : undefined,
      productName: product.name,
      sku,
      variantName,
      variantColorHex,
      image,
      quantity: itemInput.quantity,
      unitPrice,
      totalPrice,
    });
  }

  // Coupon validation & discount calculation
  let discountAmount = 0;
  let appliedCouponCode: string | undefined;

  if (input.couponCode) {
    const coupon = await Coupon.findOne({
      code: input.couponCode.toUpperCase(),
      isActive: true,
      startsAt: { $lte: new Date() },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (!coupon) {
      throw new ValidationError('Invalid or expired coupon code');
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError('Coupon usage limit reached');
    }

    if (userId && coupon.userUsageLimit > 0) {
      const userUsage = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: userId,
      });
      if (userUsage >= coupon.userUsageLimit) {
        throw new ValidationError('You have already used this coupon maximum times');
      }
    }

    if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
      throw new ValidationError(
        `Order subtotal does not meet minimum order value for this coupon`
      );
    }

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.floor((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    appliedCouponCode = coupon.code;
  }

  // Shipping calculation
  let shippingFee = 0;
  if (input.shippingAddress) {
    const zone = await ShippingZone.findOne({
      countries: input.shippingAddress.country.toUpperCase(),
      isActive: true,
    });

    if (zone && zone.methods.length > 0) {
      const activeMethod = zone.methods.find((m) => m.isActive) || zone.methods[0];
      if (
        zone.freeShippingThreshold &&
        zone.freeShippingThreshold > 0 &&
        subtotal >= zone.freeShippingThreshold
      ) {
        shippingFee = 0;
      } else {
        shippingFee = activeMethod ? activeMethod.price : 0;
      }
    }
  }

  const taxAmount = 0; // Tax rate configurable
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    couponCode: appliedCouponCode,
    shippingFee,
    taxAmount,
    grandTotal,
    currency: config.store.currency,
  };
}

/**
 * Creates an authoritative order, reserves inventory atomically, creates payment session.
 */
export async function createOrder(
  input: CreateOrderInput,
  userId?: string
): Promise<{
  order: IOrder;
  checkoutUrl: string;
  sessionId: string;
}> {
  if (!userId && (!input.guestEmail || !input.guestName)) {
    throw new ValidationError('Guest checkout requires both full name and email address');
  }

  // Verify email requirement for checkout
  if (!userId && input.guestEmail) {
    const verifiedOtp = await CheckoutOtp.findOne({
      email: input.guestEmail.toLowerCase().trim(),
      verificationToken: input.emailVerificationToken,
      isVerified: true,
    });

    if (!verifiedOtp && !config.isTest) {
      throw new ValidationError(
        'Please verify your email address before finalizing vehicle delivery checkout.'
      );
    }
  }

  // 1. Authoritative price recalculation
  const calculated = await calculateCheckout(input, userId);

  // 2. Generate unique order number
  const orderNumber = generateOrderNumber();

  // 3. Reserve inventory atomically
  const reserveItems = calculated.items.map((i) => ({
    productId: i.product.toString(),
    variantId: i.variantId ? i.variantId.toString() : undefined,
    quantity: i.quantity,
    sku: i.sku,
  }));

  await reserveInventoryBatch(reserveItems, orderNumber);

  // 4. Create Order document in DB
  const isCod = input.paymentProvider === 'cod';

  // Format combined handover & customer notes
  const handoverNotes = input.deliveryHandover?.handoverNotes;
  const timeSlot = input.deliveryHandover?.preferredTimeSlot;
  const prefDate = input.deliveryHandover?.preferredDate;
  const combinedNotes = [
    input.customerNotes,
    prefDate ? `Preferred Handover Date: ${prefDate}` : null,
    timeSlot ? `Preferred Window: ${timeSlot.toUpperCase()}` : null,
    input.nationalIdOrCnic ? `Recipient CNIC/ID: ${input.nationalIdOrCnic}` : null,
    handoverNotes ? `Handover Instructions: ${handoverNotes}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const order = await Order.create({
    orderNumber,
    user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    guestEmail: userId ? undefined : input.guestEmail,
    guestName: userId ? undefined : input.guestName,
    items: calculated.items,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress || input.shippingAddress,
    subtotal: calculated.subtotal,
    discountAmount: calculated.discountAmount,
    couponCode: calculated.couponCode,
    shippingFee: calculated.shippingFee,
    taxAmount: calculated.taxAmount,
    grandTotal: calculated.grandTotal,
    currency: calculated.currency,
    paymentProvider: input.paymentProvider,
    paymentStatus: 'pending',
    orderStatus: isCod ? 'confirmed' : 'pending_payment',
    customerNotes: combinedNotes,
    metadata: {
      vehicleHandover: {
        preferredDate: input.deliveryHandover?.preferredDate,
        preferredTimeSlot: input.deliveryHandover?.preferredTimeSlot,
        handoverType: input.deliveryHandover?.handoverType || 'home_delivery',
        landmarkOrCrossStreet: input.deliveryHandover?.landmarkOrCrossStreet,
        handoverNotes: input.deliveryHandover?.handoverNotes,
        nationalIdOrCnic: input.nationalIdOrCnic,
        guestPhone: input.guestPhone || input.shippingAddress.phone,
      },
      verifiedEmail: userId ? true : !!input.emailVerificationToken,
    },
    statusHistory: [
      {
        status: isCod ? 'confirmed' : 'pending_payment',
        timestamp: new Date(),
        note: `Order placed via ${input.paymentProvider.toUpperCase()} with complete vehicle delivery information`,
      },
    ],
  });

  // 5. Record Coupon usage if applied
  if (calculated.couponCode) {
    const coupon = await Coupon.findOne({ code: calculated.couponCode });
    if (coupon) {
      await CouponUsage.create({
        coupon: coupon._id,
        couponCode: coupon.code,
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        order: order._id,
        orderNumber: order.orderNumber,
        discountAmount: calculated.discountAmount,
      });

      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
    }
  }

  // 6. Initiate Payment Provider Checkout
  const provider = getPaymentProvider(input.paymentProvider);

  const customerName = userId ? 'Valued Customer' : input.guestName || 'Customer';
  const customerEmail = input.guestEmail || 'customer@evee.pk';

  const checkoutResult = await provider.createCheckout({
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: input.shippingAddress.phone,
    },
    items: calculated.items.map((i) => ({
      name: i.productName + (i.variantName ? ` - ${i.variantName}` : ''),
      unitAmount: i.unitPrice,
      quantity: i.quantity,
      images: i.image ? [i.image] : undefined,
    })),
    subtotal: calculated.subtotal,
    discountAmount: calculated.discountAmount,
    shippingFee: calculated.shippingFee,
    taxAmount: calculated.taxAmount,
    grandTotal: calculated.grandTotal,
    currency: calculated.currency,
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
  });

  // 7. Update order with payment reference
  order.paymentReference = checkoutResult.sessionId;
  await order.save();

  // 8. Create Payment record
  await Payment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    provider: input.paymentProvider,
    providerSessionId: checkoutResult.sessionId,
    amount: calculated.grandTotal,
    currency: calculated.currency,
    status: 'pending',
  });

  return {
    order,
    checkoutUrl: checkoutResult.checkoutUrl,
    sessionId: checkoutResult.sessionId,
  };
}

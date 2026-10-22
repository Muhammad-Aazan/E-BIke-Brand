"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/config/index.ts
var config_exports = {};
__export(config_exports, {
  config: () => config
});
function requireEnv(name, defaultValue) {
  const value = process.env[name] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function optionalEnv(name, defaultValue = "") {
  return process.env[name] ?? defaultValue;
}
function numEnv(name, defaultValue) {
  const val = process.env[name];
  return val ? parseInt(val, 10) : defaultValue;
}
function boolEnv(name, defaultValue) {
  const val = process.env[name];
  if (!val) return defaultValue;
  return val.toLowerCase() === "true" || val === "1";
}
var import_dotenv, import_path, config;
var init_config = __esm({
  "src/config/index.ts"() {
    "use strict";
    import_dotenv = __toESM(require("dotenv"));
    import_path = __toESM(require("path"));
    try {
      import_dotenv.default.config();
      import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
      import_dotenv.default.config({ path: import_path.default.resolve(__dirname, "../../../.env") });
    } catch {
    }
    config = {
      env: process.env.NODE_ENV || "development",
      isProduction: process.env.NODE_ENV === "production",
      isDevelopment: process.env.NODE_ENV === "development",
      isTest: process.env.NODE_ENV === "test",
      server: {
        port: numEnv("PORT", 5e3),
        apiBaseUrl: optionalEnv("API_BASE_URL", "http://localhost:5000"),
        frontendUrl: optionalEnv("FRONTEND_URL", "http://localhost:3000"),
        corsOrigins: optionalEnv("CORSED_ORIGINS", "http://localhost:3000").split(",").map((s) => s.trim())
      },
      db: {
        uri: optionalEnv("MONGODB_URI", "mongodb://localhost:27017/evee_db"),
        name: optionalEnv("MONGODB_DB_NAME", "evee_db")
      },
      jwt: {
        accessSecret: requireEnv("JWT_ACCESS_SECRET", "dev_access_secret_change_in_production_minimum_64_chars"),
        refreshSecret: requireEnv("JWT_REFRESH_SECRET", "dev_refresh_secret_change_in_production_minimum_64_chars"),
        accessExpiry: optionalEnv("JWT_ACCESS_EXPIRY", "15m"),
        refreshExpiry: optionalEnv("JWT_REFRESH_EXPIRY", "7d")
      },
      cookie: {
        secret: requireEnv("COOKIE_SECRET", "dev_cookie_secret_change_in_production"),
        secure: boolEnv("COOKIE_SECURE", process.env.NODE_ENV === "production"),
        sameSite: optionalEnv("COOKIE_SAMESITE", "lax")
      },
      redis: {
        url: optionalEnv("REDIS_URL", "")
      },
      bcrypt: {
        saltRounds: numEnv("BCRYPT_SALT_ROUNDS", 12)
      },
      rateLimit: {
        windowMs: numEnv("RATE_LIMIT_WINDOW_MS", 6e4),
        general: numEnv("RATE_LIMIT_GENERAL_MAX", 100),
        auth: numEnv("RATE_LIMIT_AUTH_MAX", 10),
        checkout: numEnv("RATE_LIMIT_CHECKOUT_MAX", 5),
        search: numEnv("RATE_LIMIT_SEARCH_MAX", 30)
      },
      payment: {
        provider: optionalEnv("PAYMENT_PROVIDER", "stripe")
      },
      stripe: {
        secretKey: optionalEnv("STRIPE_SECRET_KEY", ""),
        publishableKey: optionalEnv("STRIPE_PUBLISHABLE_KEY", ""),
        webhookSecret: optionalEnv("STRIPE_WEBHOOK_SECRET", ""),
        currency: optionalEnv("STRIPE_CURRENCY", "pkr"),
        successUrl: optionalEnv("STRIPE_SUCCESS_URL", "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
        cancelUrl: optionalEnv("STRIPE_CANCEL_URL", "http://localhost:3000/checkout/cancel"),
        apiVersion: optionalEnv("STRIPE_API_VERSION", "2025-06-30")
      },
      cloudinary: {
        cloudName: optionalEnv("CLOUDINARY_CLOUD_NAME", ""),
        apiKey: optionalEnv("CLOUDINARY_API_KEY", ""),
        apiSecret: optionalEnv("CLOUDINARY_API_SECRET", ""),
        uploadPreset: optionalEnv("CLOUDINARY_UPLOAD_PRESET", "evee_products")
      },
      imagekit: {
        privateKey: optionalEnv("IMAGEKIT_PRIVATE_KEY", "private_oLjGFIXZ5fI5412XlxDSMBXrKi0="),
        publicKey: optionalEnv("IMAGEKIT_PUBLIC_KEY", "public_9znI8VLlozVy8R6CJMqpY9tQuCU="),
        urlEndpoint: optionalEnv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/qbwmuvvwo")
      },
      smtp: {
        host: optionalEnv("SMTP_HOST", "smtp.mailtrap.io"),
        port: numEnv("SMTP_PORT", 587),
        secure: boolEnv("SMTP_SECURE", false),
        user: optionalEnv("SMTP_USER", ""),
        pass: optionalEnv("SMTP_PASS", ""),
        fromName: optionalEnv("EMAIL_FROM_NAME", "EVee by Crown Motors"),
        fromAddress: optionalEnv("EMAIL_FROM_ADDRESS", "noreply@evee.pk")
      },
      store: {
        name: optionalEnv("STORE_NAME", "EVee"),
        company: optionalEnv("STORE_COMPANY", "Crown Motors"),
        currency: optionalEnv("STORE_CURRENCY", "PKR"),
        currencySubunit: numEnv("STORE_CURRENCY_SUBUNIT", 100),
        locale: optionalEnv("STORE_LOCALE", "en"),
        country: optionalEnv("STORE_COUNTRY", "PK"),
        supportEmail: optionalEnv("STORE_SUPPORT_EMAIL", "support@evee.pk"),
        supportPhone: optionalEnv("STORE_SUPPORT_PHONE", "")
      },
      seed: {
        adminEmail: optionalEnv("SEED_ADMIN_EMAIL", "admin@evee.pk"),
        adminPassword: optionalEnv("SEED_ADMIN_PASSWORD", "Admin@EVee2024!"),
        adminName: optionalEnv("SEED_ADMIN_NAME", "EVee Admin")
      },
      logging: {
        level: optionalEnv("LOG_LEVEL", "info"),
        dir: optionalEnv("LOG_DIR", "logs")
      }
    };
  }
});

// src/common/errors/AppError.ts
var AppError_exports = {};
__export(AppError_exports, {
  AppError: () => AppError,
  ConflictError: () => ConflictError,
  ForbiddenError: () => ForbiddenError,
  InsufficientInventoryError: () => InsufficientInventoryError,
  NotFoundError: () => NotFoundError,
  PaymentError: () => PaymentError,
  RateLimitError: () => RateLimitError,
  UnauthorizedError: () => UnauthorizedError,
  ValidationError: () => ValidationError
});
var AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError, PaymentError, RateLimitError, InsufficientInventoryError;
var init_AppError = __esm({
  "src/common/errors/AppError.ts"() {
    "use strict";
    AppError = class _AppError extends Error {
      statusCode;
      isOperational;
      code;
      details;
      constructor(message, statusCode = 500, options = {}) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = options.isOperational ?? true;
        this.code = options.code;
        this.details = options.details;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, _AppError.prototype);
      }
    };
    NotFoundError = class extends AppError {
      constructor(resource = "Resource") {
        super(`${resource} not found`, 404, { code: "NOT_FOUND" });
      }
    };
    UnauthorizedError = class extends AppError {
      constructor(message = "Authentication required") {
        super(message, 401, { code: "UNAUTHORIZED" });
      }
    };
    ForbiddenError = class extends AppError {
      constructor(message = "Access denied") {
        super(message, 403, { code: "FORBIDDEN" });
      }
    };
    ValidationError = class extends AppError {
      constructor(message = "Validation failed", details) {
        super(message, 422, { code: "VALIDATION_ERROR", details });
      }
    };
    ConflictError = class extends AppError {
      constructor(message = "Resource already exists") {
        super(message, 409, { code: "CONFLICT" });
      }
    };
    PaymentError = class extends AppError {
      constructor(message = "Payment processing failed") {
        super(message, 402, { code: "PAYMENT_ERROR" });
      }
    };
    RateLimitError = class extends AppError {
      constructor(message = "Too many requests") {
        super(message, 429, { code: "RATE_LIMIT_EXCEEDED" });
      }
    };
    InsufficientInventoryError = class extends AppError {
      constructor(productName) {
        super(
          productName ? `Insufficient inventory for: ${productName}` : "Insufficient inventory",
          409,
          { code: "INSUFFICIENT_INVENTORY" }
        );
      }
    };
  }
});

// src/database/models/User.model.ts
var import_mongoose3, addressSchema, refreshTokenSchema, userSchema, User;
var init_User_model = __esm({
  "src/database/models/User.model.ts"() {
    "use strict";
    import_mongoose3 = __toESM(require("mongoose"));
    addressSchema = new import_mongoose3.Schema({
      label: { type: String, default: "home", trim: true },
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, required: true, default: "PK" },
      isDefault: { type: Boolean, default: false }
    }, { _id: true });
    refreshTokenSchema = new import_mongoose3.Schema({
      tokenHash: { type: String, required: true },
      createdAt: { type: Date, required: true },
      expiresAt: { type: Date, required: true },
      userAgent: String,
      ipAddress: String
    }, { _id: false });
    userSchema = new import_mongoose3.Schema({
      name: { type: String, required: true, trim: true, maxlength: 100 },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"]
      },
      normalizedEmail: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true, select: false },
      phone: { type: String, trim: true },
      avatarUrl: { type: String, trim: true },
      role: {
        type: String,
        enum: ["customer", "admin", "support"],
        default: "customer"
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
        enum: ["active", "suspended", "deleted"],
        default: "active"
      },
      lastLoginAt: Date
    }, { timestamps: true });
    userSchema.index({ role: 1 });
    userSchema.index({ accountStatus: 1 });
    userSchema.index({ "refreshTokens.tokenHash": 1 });
    userSchema.set("toJSON", {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpiry;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      }
    });
    User = import_mongoose3.default.model("User", userSchema);
  }
});

// src/database/models/Category.model.ts
var import_mongoose4, categorySchema, Category;
var init_Category_model = __esm({
  "src/database/models/Category.model.ts"() {
    "use strict";
    import_mongoose4 = __toESM(require("mongoose"));
    categorySchema = new import_mongoose4.Schema({
      name: { type: String, required: true, trim: true, maxlength: 100 },
      slug: { type: String, required: true, unique: true, lowercase: true },
      description: { type: String, trim: true },
      image: String,
      parent: { type: import_mongoose4.Schema.Types.ObjectId, ref: "Category", default: null },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
      seoTitle: String,
      seoDescription: String
    }, { timestamps: true });
    categorySchema.index({ parent: 1, isActive: 1 });
    categorySchema.index({ sortOrder: 1 });
    categorySchema.set("toJSON", { versionKey: false });
    Category = import_mongoose4.default.model("Category", categorySchema);
  }
});

// src/database/models/Product.model.ts
var import_mongoose5, specificationSchema, colorVariantSchema, productSchema, Product;
var init_Product_model = __esm({
  "src/database/models/Product.model.ts"() {
    "use strict";
    import_mongoose5 = __toESM(require("mongoose"));
    specificationSchema = new import_mongoose5.Schema({
      key: { type: String, required: true },
      label: { type: String, required: true },
      value: { type: String, required: true },
      unit: String,
      group: { type: String, default: "General" }
    }, { _id: false });
    colorVariantSchema = new import_mongoose5.Schema({
      name: { type: String, required: true },
      colorHex: { type: String, required: true },
      images: [String],
      sku: { type: String, required: true },
      additionalPrice: { type: Number, default: 0 },
      inventory: { type: Number, default: 0, min: 0 },
      reservedInventory: { type: Number, default: 0, min: 0 },
      isActive: { type: Boolean, default: true }
    }, { _id: true });
    productSchema = new import_mongoose5.Schema({
      name: { type: String, required: true, trim: true, maxlength: 200 },
      slug: { type: String, required: true, unique: true, lowercase: true },
      sku: { type: String, required: true, unique: true, uppercase: true },
      description: { type: String, required: true },
      shortDescription: String,
      category: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Category", required: true },
      brand: { type: String, default: "EVee", trim: true },
      productType: {
        type: String,
        enum: ["motorcycle", "scooter", "accessory", "part"],
        required: true
      },
      basePrice: { type: Number, required: true, min: 0 },
      compareAtPrice: { type: Number, min: 0 },
      currency: { type: String, default: "PKR" },
      images: [String],
      specifications: [specificationSchema],
      colorVariants: [colorVariantSchema],
      inventory: { type: Number, default: 0, min: 0 },
      reservedInventory: { type: Number, default: 0, min: 0 },
      inventoryPolicy: {
        type: String,
        enum: ["track", "preorder", "unlimited"],
        default: "track"
      },
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      },
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      tags: [String],
      seoTitle: String,
      seoDescription: String,
      seoKeywords: [String],
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0, min: 0 },
      soldCount: { type: Number, default: 0, min: 0 }
    }, { timestamps: true });
    productSchema.index({ category: 1, isActive: 1 });
    productSchema.index({ productType: 1, isActive: 1 });
    productSchema.index({ isFeatured: 1, isActive: 1 });
    productSchema.index({ basePrice: 1 });
    productSchema.index({ averageRating: -1 });
    productSchema.index({ soldCount: -1 });
    productSchema.index({ createdAt: -1 });
    productSchema.index({ name: "text", description: "text", tags: "text" }, {
      weights: { name: 3, tags: 2, description: 1 },
      name: "product_text_index"
    });
    productSchema.index({ "colorVariants.sku": 1 });
    productSchema.set("toJSON", { versionKey: false });
    Product = import_mongoose5.default.model("Product", productSchema);
  }
});

// src/database/models/Cart.model.ts
var import_mongoose6, cartItemSchema, cartSchema, Cart;
var init_Cart_model = __esm({
  "src/database/models/Cart.model.ts"() {
    "use strict";
    import_mongoose6 = __toESM(require("mongoose"));
    cartItemSchema = new import_mongoose6.Schema({
      product: { type: import_mongoose6.Schema.Types.ObjectId, ref: "Product", required: true },
      variantId: import_mongoose6.Schema.Types.ObjectId,
      quantity: { type: Number, required: true, min: 1, max: 999 },
      productName: { type: String, required: true },
      sku: { type: String, required: true },
      unitPrice: { type: Number, required: true, min: 0 },
      variantName: String,
      variantColorHex: String,
      image: String
    }, { _id: true });
    cartSchema = new import_mongoose6.Schema({
      user: { type: import_mongoose6.Schema.Types.ObjectId, ref: "User" },
      sessionId: { type: String },
      items: { type: [cartItemSchema], default: [] },
      couponCode: String,
      expiresAt: { type: Date }
    }, { timestamps: true });
    cartSchema.index({ user: 1 }, { sparse: true });
    cartSchema.index({ sessionId: 1 }, { sparse: true });
    cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    cartSchema.set("toJSON", { versionKey: false });
    Cart = import_mongoose6.default.model("Cart", cartSchema);
  }
});

// src/database/models/Order.model.ts
var import_mongoose7, orderItemSchema, addressSnapshotSchema, orderSchema, Order;
var init_Order_model = __esm({
  "src/database/models/Order.model.ts"() {
    "use strict";
    import_mongoose7 = __toESM(require("mongoose"));
    orderItemSchema = new import_mongoose7.Schema({
      product: { type: import_mongoose7.Schema.Types.ObjectId, ref: "Product", required: true },
      variantId: import_mongoose7.Schema.Types.ObjectId,
      productName: { type: String, required: true },
      sku: { type: String, required: true },
      variantName: String,
      variantColorHex: String,
      image: String,
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      totalPrice: { type: Number, required: true, min: 0 }
    }, { _id: false });
    addressSnapshotSchema = new import_mongoose7.Schema({
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: String,
      postalCode: String,
      country: { type: String, required: true, default: "PK" }
    }, { _id: false });
    orderSchema = new import_mongoose7.Schema({
      orderNumber: { type: String, required: true, unique: true },
      user: { type: import_mongoose7.Schema.Types.ObjectId, ref: "User", sparse: true },
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
      currency: { type: String, default: "PKR" },
      paymentProvider: {
        type: String,
        enum: ["stripe", "cod", "bank_transfer"],
        required: true
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
        default: "pending"
      },
      orderStatus: {
        type: String,
        enum: [
          "pending_payment",
          "confirmed",
          "processing",
          "ready_to_ship",
          "shipped",
          "delivered",
          "cancelled",
          "partially_refunded",
          "refunded"
        ],
        default: "pending_payment"
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
      metadata: import_mongoose7.Schema.Types.Mixed,
      statusHistory: [{
        status: { type: String, required: true },
        timestamp: { type: Date, required: true },
        note: String,
        updatedBy: import_mongoose7.Schema.Types.ObjectId
      }]
    }, { timestamps: true });
    orderSchema.index({ user: 1, createdAt: -1 });
    orderSchema.index({ orderStatus: 1, createdAt: -1 });
    orderSchema.index({ paymentStatus: 1 });
    orderSchema.index({ paymentReference: 1 }, { sparse: true });
    orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
    orderSchema.index({ guestEmail: 1 }, { sparse: true });
    orderSchema.index({ createdAt: -1 });
    orderSchema.set("toJSON", { versionKey: false });
    Order = import_mongoose7.default.model("Order", orderSchema);
  }
});

// src/database/models/Payment.model.ts
var import_mongoose8, refundSchema, paymentSchema, Payment;
var init_Payment_model = __esm({
  "src/database/models/Payment.model.ts"() {
    "use strict";
    import_mongoose8 = __toESM(require("mongoose"));
    refundSchema = new import_mongoose8.Schema({
      refundId: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      reason: String,
      status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
      requestedAt: { type: Date, required: true },
      processedAt: Date,
      requestedBy: import_mongoose8.Schema.Types.ObjectId
    }, { _id: false });
    paymentSchema = new import_mongoose8.Schema({
      order: { type: import_mongoose8.Schema.Types.ObjectId, ref: "Order", required: true },
      orderNumber: { type: String, required: true },
      provider: { type: String, enum: ["stripe", "cod", "bank_transfer"], required: true },
      providerSessionId: String,
      providerPaymentIntentId: String,
      providerChargeId: String,
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "cancelled", "refunded", "partially_refunded"],
        default: "pending"
      },
      refunds: [refundSchema],
      refundedTotal: { type: Number, default: 0, min: 0 },
      processedEventIds: [String],
      metadata: import_mongoose8.Schema.Types.Mixed,
      paidAt: Date,
      failedAt: Date,
      failureReason: String
    }, { timestamps: true });
    paymentSchema.index({ order: 1 });
    paymentSchema.index({ orderNumber: 1 });
    paymentSchema.index({ providerSessionId: 1 }, { sparse: true });
    paymentSchema.index({ providerPaymentIntentId: 1 }, { sparse: true });
    paymentSchema.index({ processedEventIds: 1 });
    paymentSchema.set("toJSON", { versionKey: false });
    Payment = import_mongoose8.default.model("Payment", paymentSchema);
  }
});

// src/database/models/Coupon.model.ts
var import_mongoose9, couponSchema, Coupon;
var init_Coupon_model = __esm({
  "src/database/models/Coupon.model.ts"() {
    "use strict";
    import_mongoose9 = __toESM(require("mongoose"));
    couponSchema = new import_mongoose9.Schema({
      code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9_-]{3,30}$/, "Invalid coupon code format"]
      },
      description: String,
      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true
      },
      discountValue: { type: Number, required: true, min: 0 },
      minimumOrderValue: { type: Number, default: 0, min: 0 },
      maximumDiscountAmount: { type: Number, min: 0 },
      usageLimit: { type: Number, default: 0, min: 0 },
      usageCount: { type: Number, default: 0, min: 0 },
      userUsageLimit: { type: Number, default: 1, min: 0 },
      applicableProducts: [{ type: import_mongoose9.Schema.Types.ObjectId, ref: "Product" }],
      applicableCategories: [{ type: import_mongoose9.Schema.Types.ObjectId, ref: "Category" }],
      restrictedUsers: [{ type: import_mongoose9.Schema.Types.ObjectId, ref: "User" }],
      startsAt: { type: Date, required: true },
      expiresAt: Date,
      isActive: { type: Boolean, default: true },
      createdBy: { type: import_mongoose9.Schema.Types.ObjectId, ref: "User", required: true }
    }, { timestamps: true });
    couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });
    couponSchema.set("toJSON", { versionKey: false });
    Coupon = import_mongoose9.default.model("Coupon", couponSchema);
  }
});

// src/database/models/CouponUsage.model.ts
var import_mongoose10, couponUsageSchema, CouponUsage;
var init_CouponUsage_model = __esm({
  "src/database/models/CouponUsage.model.ts"() {
    "use strict";
    import_mongoose10 = __toESM(require("mongoose"));
    couponUsageSchema = new import_mongoose10.Schema({
      coupon: { type: import_mongoose10.Schema.Types.ObjectId, ref: "Coupon", required: true },
      couponCode: { type: String, required: true, uppercase: true },
      user: { type: import_mongoose10.Schema.Types.ObjectId, ref: "User", sparse: true },
      order: { type: import_mongoose10.Schema.Types.ObjectId, ref: "Order", required: true },
      orderNumber: { type: String, required: true },
      discountAmount: { type: Number, required: true, min: 0 }
    }, { timestamps: { createdAt: true, updatedAt: false } });
    couponUsageSchema.index({ coupon: 1 });
    couponUsageSchema.index({ user: 1, coupon: 1 }, { sparse: true });
    couponUsageSchema.index({ orderNumber: 1 });
    CouponUsage = import_mongoose10.default.model("CouponUsage", couponUsageSchema);
  }
});

// src/database/models/Review.model.ts
var import_mongoose11, reviewSchema, Review;
var init_Review_model = __esm({
  "src/database/models/Review.model.ts"() {
    "use strict";
    import_mongoose11 = __toESM(require("mongoose"));
    reviewSchema = new import_mongoose11.Schema({
      product: { type: import_mongoose11.Schema.Types.ObjectId, ref: "Product", required: true },
      user: { type: import_mongoose11.Schema.Types.ObjectId, ref: "User", required: true },
      order: { type: import_mongoose11.Schema.Types.ObjectId, ref: "Order" },
      rating: { type: Number, required: true, min: 1, max: 5 },
      title: { type: String, trim: true, maxlength: 200 },
      body: { type: String, required: true, trim: true, maxlength: 5e3 },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      isVerifiedPurchase: { type: Boolean, default: false },
      helpfulVotes: { type: Number, default: 0, min: 0 },
      reportedBy: [{ type: import_mongoose11.Schema.Types.ObjectId, ref: "User" }],
      adminNote: String,
      reviewedAt: Date
    }, { timestamps: true });
    reviewSchema.index({ product: 1, user: 1 }, { unique: true });
    reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
    reviewSchema.index({ user: 1, createdAt: -1 });
    reviewSchema.index({ status: 1 });
    reviewSchema.set("toJSON", { versionKey: false });
    Review = import_mongoose11.default.model("Review", reviewSchema);
  }
});

// src/database/models/Wishlist.model.ts
var import_mongoose12, wishlistSchema, Wishlist;
var init_Wishlist_model = __esm({
  "src/database/models/Wishlist.model.ts"() {
    "use strict";
    import_mongoose12 = __toESM(require("mongoose"));
    wishlistSchema = new import_mongoose12.Schema({
      user: { type: import_mongoose12.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      products: [{ type: import_mongoose12.Schema.Types.ObjectId, ref: "Product" }]
    }, { timestamps: true });
    wishlistSchema.set("toJSON", { versionKey: false });
    Wishlist = import_mongoose12.default.model("Wishlist", wishlistSchema);
  }
});

// src/database/models/ShippingZone.model.ts
var import_mongoose13, shippingMethodSchema, shippingZoneSchema, ShippingZone;
var init_ShippingZone_model = __esm({
  "src/database/models/ShippingZone.model.ts"() {
    "use strict";
    import_mongoose13 = __toESM(require("mongoose"));
    shippingMethodSchema = new import_mongoose13.Schema({
      name: { type: String, required: true },
      description: String,
      price: { type: Number, required: true, min: 0 },
      estimatedDaysMin: { type: Number, required: true, min: 0 },
      estimatedDaysMax: { type: Number, required: true, min: 0 },
      isActive: { type: Boolean, default: true },
      restrictions: {
        maxWeight: Number,
        productTypes: [String],
        requiresPickup: Boolean
      }
    }, { _id: false });
    shippingZoneSchema = new import_mongoose13.Schema({
      name: { type: String, required: true, trim: true },
      description: String,
      countries: [{ type: String, required: true }],
      cities: [String],
      methods: [shippingMethodSchema],
      freeShippingThreshold: { type: Number, default: 0, min: 0 },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });
    shippingZoneSchema.index({ countries: 1, isActive: 1 });
    shippingZoneSchema.set("toJSON", { versionKey: false });
    ShippingZone = import_mongoose13.default.model("ShippingZone", shippingZoneSchema);
  }
});

// src/database/models/InventoryMovement.model.ts
var import_mongoose14, inventoryMovementSchema, InventoryMovement;
var init_InventoryMovement_model = __esm({
  "src/database/models/InventoryMovement.model.ts"() {
    "use strict";
    import_mongoose14 = __toESM(require("mongoose"));
    inventoryMovementSchema = new import_mongoose14.Schema({
      product: { type: import_mongoose14.Schema.Types.ObjectId, ref: "Product", required: true },
      variantId: import_mongoose14.Schema.Types.ObjectId,
      sku: { type: String, required: true },
      movementType: {
        type: String,
        enum: ["sale", "restock", "adjustment", "reservation", "reservation_release", "return", "damage"],
        required: true
      },
      quantity: { type: Number, required: true },
      balanceBefore: { type: Number, required: true },
      balanceAfter: { type: Number, required: true },
      reference: String,
      note: String,
      performedBy: import_mongoose14.Schema.Types.ObjectId
    }, { timestamps: { createdAt: true, updatedAt: false } });
    inventoryMovementSchema.index({ product: 1, createdAt: -1 });
    inventoryMovementSchema.index({ sku: 1, createdAt: -1 });
    inventoryMovementSchema.index({ reference: 1 }, { sparse: true });
    InventoryMovement = import_mongoose14.default.model("InventoryMovement", inventoryMovementSchema);
  }
});

// src/database/models/AuditLog.model.ts
var import_mongoose15, auditLogSchema, AuditLog;
var init_AuditLog_model = __esm({
  "src/database/models/AuditLog.model.ts"() {
    "use strict";
    import_mongoose15 = __toESM(require("mongoose"));
    auditLogSchema = new import_mongoose15.Schema({
      action: { type: String, required: true },
      entity: { type: String, required: true },
      entityId: String,
      performedBy: { type: import_mongoose15.Schema.Types.ObjectId, ref: "User", required: true },
      performedByRole: { type: String, required: true },
      ipAddress: String,
      userAgent: String,
      changes: {
        before: import_mongoose15.Schema.Types.Mixed,
        after: import_mongoose15.Schema.Types.Mixed
      },
      metadata: import_mongoose15.Schema.Types.Mixed
    }, { timestamps: { createdAt: true, updatedAt: false } });
    auditLogSchema.index({ performedBy: 1, createdAt: -1 });
    auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
    auditLogSchema.index({ action: 1, createdAt: -1 });
    auditLogSchema.index({ createdAt: -1 });
    AuditLog = import_mongoose15.default.model("AuditLog", auditLogSchema);
  }
});

// src/database/models/WebhookEvent.model.ts
var import_mongoose16, webhookEventSchema, WebhookEvent;
var init_WebhookEvent_model = __esm({
  "src/database/models/WebhookEvent.model.ts"() {
    "use strict";
    import_mongoose16 = __toESM(require("mongoose"));
    webhookEventSchema = new import_mongoose16.Schema({
      provider: { type: String, required: true },
      eventId: { type: String, required: true },
      eventType: { type: String, required: true },
      payload: { type: import_mongoose16.Schema.Types.Mixed, required: true },
      status: {
        type: String,
        enum: ["received", "processed", "failed", "ignored"],
        default: "received"
      },
      processingError: String,
      processedAt: Date
    }, { timestamps: { createdAt: true, updatedAt: false } });
    webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
    webhookEventSchema.index({ status: 1, createdAt: -1 });
    webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
    WebhookEvent = import_mongoose16.default.model("WebhookEvent", webhookEventSchema);
  }
});

// src/database/models/checkout-otp.model.ts
var import_mongoose17, checkoutOtpSchema, CheckoutOtp;
var init_checkout_otp_model = __esm({
  "src/database/models/checkout-otp.model.ts"() {
    "use strict";
    import_mongoose17 = __toESM(require("mongoose"));
    checkoutOtpSchema = new import_mongoose17.Schema(
      {
        email: { type: String, required: true, lowercase: true, trim: true },
        otp: { type: String, required: true },
        verificationToken: { type: String },
        isVerified: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
      },
      { timestamps: true }
    );
    checkoutOtpSchema.index({ email: 1, isVerified: 1 });
    checkoutOtpSchema.index({ verificationToken: 1 });
    CheckoutOtp = import_mongoose17.default.model(
      "CheckoutOtp",
      checkoutOtpSchema
    );
  }
});

// src/database/models/ContactRequest.model.ts
var import_mongoose18, ContactRequestSchema, ContactRequest;
var init_ContactRequest_model = __esm({
  "src/database/models/ContactRequest.model.ts"() {
    "use strict";
    import_mongoose18 = __toESM(require("mongoose"));
    ContactRequestSchema = new import_mongoose18.Schema(
      {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        subject: { type: String, required: true, trim: true, maxlength: 200 },
        message: { type: String, required: true, trim: true, maxlength: 2e3 },
        requestType: {
          type: String,
          enum: ["contact", "booking", "test_ride", "service"],
          default: "contact"
        },
        status: {
          type: String,
          enum: ["new", "read", "replied", "closed"],
          default: "new"
        },
        adminNote: { type: String, trim: true },
        adminReplyTime: { type: Date },
        adminReplyLocation: { type: String, trim: true },
        ipAddress: { type: String }
      },
      { timestamps: true }
    );
    ContactRequest = import_mongoose18.default.model("ContactRequest", ContactRequestSchema);
  }
});

// src/database/models/index.ts
var models_exports = {};
__export(models_exports, {
  AuditLog: () => AuditLog,
  Cart: () => Cart,
  Category: () => Category,
  CheckoutOtp: () => CheckoutOtp,
  ContactRequest: () => ContactRequest,
  Coupon: () => Coupon,
  CouponUsage: () => CouponUsage,
  InventoryMovement: () => InventoryMovement,
  Order: () => Order,
  Payment: () => Payment,
  Product: () => Product,
  Review: () => Review,
  ShippingZone: () => ShippingZone,
  User: () => User,
  WebhookEvent: () => WebhookEvent,
  Wishlist: () => Wishlist
});
var init_models = __esm({
  "src/database/models/index.ts"() {
    "use strict";
    init_User_model();
    init_Category_model();
    init_Product_model();
    init_Cart_model();
    init_Order_model();
    init_Payment_model();
    init_Coupon_model();
    init_CouponUsage_model();
    init_Review_model();
    init_Wishlist_model();
    init_ShippingZone_model();
    init_InventoryMovement_model();
    init_AuditLog_model();
    init_WebhookEvent_model();
    init_checkout_otp_model();
    init_ContactRequest_model();
  }
});

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/app.ts
var import_express19 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_compression = __toESM(require("compression"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_express_mongo_sanitize = __toESM(require("express-mongo-sanitize"));
var import_morgan = __toESM(require("morgan"));
init_config();

// node_modules/uuid/dist-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist-node/rng.js
var rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}

// node_modules/uuid/dist-node/v4.js
function v4(options, buf, offset) {
  if (!buf && !options && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/common/middleware/requestId.ts
function requestIdMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"] || v4_default();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}

// src/common/middleware/rateLimiter.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"));
init_config();
var createLimiter = (max, windowMs, message) => (0, import_express_rate_limit.default)({
  windowMs: windowMs ?? config.rateLimit.windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: message ?? "Too many requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  skip: () => config.isTest
});
var generalLimiter = createLimiter(config.rateLimit.general);
var authLimiter = createLimiter(config.rateLimit.auth, 15 * 60 * 1e3, "Too many authentication attempts");
var checkoutLimiter = createLimiter(config.rateLimit.checkout, 60 * 1e3, "Too many checkout requests");
var searchLimiter = createLimiter(config.rateLimit.search);

// src/common/middleware/errorHandler.ts
var import_zod = require("zod");
var import_mongoose = __toESM(require("mongoose"));
init_AppError();

// src/common/utils/logger.ts
var import_winston = __toESM(require("winston"));
var import_path2 = __toESM(require("path"));
init_config();
var { combine, timestamp, printf, colorize, json, errors } = import_winston.default.format;
var developmentFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: timestamp2, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `
${JSON.stringify(meta, null, 2)}` : "";
    return `${timestamp2} [${level}]: ${stack || message}${metaStr}`;
  })
);
var productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);
var logger = import_winston.default.createLogger({
  level: config.logging.level,
  format: config.isProduction ? productionFormat : developmentFormat,
  transports: [
    new import_winston.default.transports.Console(),
    ...config.isProduction && !process.env.VERCEL ? [
      new import_winston.default.transports.File({
        filename: import_path2.default.join(config.logging.dir, "error.log"),
        level: "error"
      }),
      new import_winston.default.transports.File({
        filename: import_path2.default.join(config.logging.dir, "combined.log")
      })
    ] : []
  ]
});

// src/common/middleware/errorHandler.ts
init_config();
function errorHandler(err, req, res, _next) {
  if (err instanceof import_zod.ZodError) {
    const issues = err.issues || err.errors || [];
    const details = issues.map((e) => ({
      field: e.path.join("."),
      message: e.message
    }));
    const primaryMessage = details[0]?.message || "Validation failed";
    res.status(422).json({
      success: false,
      error: primaryMessage,
      // Meaningful message for toast/alert notifications
      code: "VALIDATION_ERROR",
      details
      // Per-field messages for form field highlighting
    });
    return;
  }
  if (err.name === "MongoServerError" && err.code === 11e3) {
    const rawField = Object.keys(err.keyPattern || {})[0] || "field";
    const readableField = rawField === "normalizedEmail" || rawField === "email" ? "email address" : rawField === "sku" ? "SKU" : rawField === "code" ? "coupon code" : rawField === "slug" ? "URL slug" : rawField;
    res.status(409).json({
      success: false,
      error: `A record with this ${readableField} already exists in the system`,
      code: "CONFLICT",
      field: rawField
    });
    return;
  }
  if (err instanceof import_mongoose.default.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    const primaryMessage = details[0]?.message || "Validation failed";
    res.status(422).json({
      success: false,
      error: primaryMessage,
      code: "VALIDATION_ERROR",
      details
    });
    return;
  }
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid authentication token. Please log in again.",
      code: "UNAUTHORIZED"
    });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Session expired. Please log in again.",
      code: "TOKEN_EXPIRED"
    });
    return;
  }
  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      logger.error("Operational error:", { message: err.message, code: err.code, stack: err.stack });
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...err.details ? { details: err.details } : {}
    });
    return;
  }
  logger.error("Unhandled server error:", { message: err.message, stack: err.stack, path: req.path });
  res.status(500).json({
    success: false,
    error: config.isProduction ? "An unexpected error occurred. Please contact support." : err.message,
    code: "INTERNAL_SERVER_ERROR"
  });
}
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}. The requested endpoint does not exist.`,
    code: "NOT_FOUND"
  });
}

// src/modules/health/health.routes.ts
var import_express = require("express");
var import_mongoose2 = __toESM(require("mongoose"));
var healthRouter = (0, import_express.Router)();
healthRouter.get("/health", (_req, res) => {
  const dbState = import_mongoose2.default.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : "disconnected";
  const status = dbState === 1 ? "ok" : "degraded";
  res.status(dbState === 1 ? 200 : 503).json({
    success: true,
    data: {
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "EVee API",
      version: "1.0.0",
      database: dbStatus,
      uptime: process.uptime()
    }
  });
});

// src/modules/auth/auth.routes.ts
var import_express2 = require("express");

// src/modules/auth/auth.controller.ts
init_config();

// src/modules/auth/auth.service.ts
var import_crypto = __toESM(require("crypto"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
init_config();
init_models();
init_AppError();

// src/modules/notifications/email.service.ts
var import_nodemailer = __toESM(require("nodemailer"));
init_config();
var transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = import_nodemailer.default.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : void 0
  });
  return transporter;
}
async function sendEmail(options) {
  if (config.isTest) {
    logger.debug("Email suppressed in test mode:", { to: options.to, subject: options.subject });
    return;
  }
  const transport = getTransporter();
  try {
    await transport.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    logger.info("Email sent:", { to: options.to, subject: options.subject });
  } catch (error) {
    logger.error("Email send failed:", { to: options.to, subject: options.subject, error });
    throw error;
  }
}
var storeUrl = config.server.frontendUrl;
async function sendVerificationEmail(to, name, token) {
  const verifyUrl = `${storeUrl}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: `Verify your EVee account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Welcome to EVee, ${name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verifyUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #00d4aa;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Verify Email Address</a>
        </p>
        <p style="color: #666;">This link expires in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you did not create an account, please ignore this email.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Welcome to EVee! Verify your email: ${verifyUrl}`
  });
}
async function sendPasswordResetEmail(to, name, token) {
  const resetUrl = `${storeUrl}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: `Reset your EVee password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <p>
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #00d4aa;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Reset Password</a>
        </p>
        <p style="color: #666;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Reset your EVee password: ${resetUrl} (expires in 1 hour)`
  });
}
async function sendOrderConfirmationEmail(to, name, orderNumber, items, total) {
  const orderUrl = `${storeUrl}/orders/${orderNumber}`;
  const itemsHtml = items.map(
    (item) => `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
        </tr>`
  ).join("");
  await sendEmail({
    to,
    subject: `Order Confirmed \u2014 ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Order Confirmed!</h2>
        <p>Hi ${name}, thank you for your order.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total: ${total}</strong></p>
        <p><a href="${orderUrl}">Track your order</a></p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Order ${orderNumber} confirmed. Total: ${total}. Track: ${orderUrl}`
  });
}
async function sendShipmentEmail(to, name, orderNumber, carrier, trackingNumber) {
  await sendEmail({
    to,
    subject: `Your EVee order ${orderNumber} has shipped!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Your Order Has Shipped!</h2>
        <p>Hi ${name}, great news! Your order ${orderNumber} is on its way.</p>
        <p><strong>Carrier:</strong> ${carrier}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Order ${orderNumber} shipped via ${carrier}. Tracking: ${trackingNumber}`
  });
}
async function sendCancellationEmail(to, name, orderNumber, reason) {
  await sendEmail({
    to,
    subject: `Order ${orderNumber} Cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Order Cancelled</h2>
        <p>Hi ${name}, your order ${orderNumber} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>If you have questions, please contact us at ${config.store.supportEmail}.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Order ${orderNumber} cancelled.${reason ? ` Reason: ${reason}` : ""}`
  });
}
async function sendRefundEmail(to, name, orderNumber, refundAmount) {
  await sendEmail({
    to,
    subject: `Refund processed for order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Refund Processed</h2>
        <p>Hi ${name}, a refund of <strong>${refundAmount}</strong> has been processed for order ${orderNumber}.</p>
        <p>Please allow 5\u201310 business days for the refund to appear in your account.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Refund of ${refundAmount} processed for order ${orderNumber}.`
  });
}
async function sendCheckoutOtpEmail(to, name, otp) {
  await sendEmail({
    to,
    subject: `Your Crown Motors Vehicle Verification Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0b0c0e; color: #ffffff; padding: 32px; border-radius: 8px;">
        <div style="border-bottom: 1px solid #222; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; color: #d4e790; text-transform: uppercase;">Crown Motors</h1>
          <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 1px; color: #888; text-transform: uppercase;">Electric Vehicle Handover Verification</p>
        </div>
        <p style="font-size: 15px; color: #e0e0e0; margin-bottom: 16px;">Hello ${name || "Valued Customer"},</p>
        <p style="font-size: 14px; color: #aaa; line-height: 1.6; margin-bottom: 24px;">
          Use the 6-digit verification code below to verify your email address and authorize your electric vehicle reservation and handover dispatch.
        </p>
        <div style="background-color: #16181d; border: 1px solid #2a2d35; border-radius: 8px; text-align: center; padding: 24px; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #d4e790;">${otp}</span>
          <p style="font-size: 12px; color: #777; margin: 12px 0 0;">This code is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
        <p style="font-size: 13px; color: #888; line-height: 1.5;">
          Our concierge team requires a verified email to ensure your registration paperwork, VIN documentation, and white-glove delivery tracking reach you securely.
        </p>
        <hr style="border: none; border-top: 1px solid #222; margin: 28px 0 20px;" />
        <p style="font-size: 11px; color: #555; margin: 0;">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Crown Motors / EVee Pakistan. All rights reserved.
        </p>
      </div>
    `,
    text: `Crown Motors Verification Code: ${otp}. Valid for 10 minutes. Verify your email for electric vehicle reservation and handover dispatch.`
  });
}

// src/modules/auth/auth.service.ts
var ACCESS_EXPIRY = config.jwt.accessExpiry;
var REFRESH_EXPIRY = config.jwt.refreshExpiry;
var SALT_ROUNDS = config.bcrypt.saltRounds;
function generateAccessToken(user) {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email
  };
  return import_jsonwebtoken.default.sign(payload, config.jwt.accessSecret, { expiresIn: ACCESS_EXPIRY });
}
function generateRefreshToken() {
  return import_crypto.default.randomBytes(64).toString("hex");
}
function hashToken(token) {
  return import_crypto.default.createHash("sha256").update(token).digest("hex");
}
function generateSecureToken() {
  return import_crypto.default.randomBytes(32).toString("hex");
}
async function register(data) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existingUser = await User.findOne({ normalizedEmail });
  if (existingUser) {
    throw new ConflictError("An account with this email already exists");
  }
  const passwordHash = await import_bcryptjs.default.hash(data.password, SALT_ROUNDS);
  const verificationToken = generateSecureToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
  const user = await User.create({
    name: data.name,
    email: normalizedEmail,
    normalizedEmail,
    passwordHash,
    phone: data.phone,
    role: "customer",
    emailVerified: false,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpiry: verificationExpiry
  });
  sendVerificationEmail(user.email, user.name, verificationToken).catch(
    (err) => logger.error("Failed to send verification email:", { userId: user._id, error: err.message })
  );
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await addRefreshToken(user, refreshToken);
  return { user, accessToken, refreshToken };
}
async function login(email, password, meta) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ normalizedEmail }).select("+passwordHash +refreshTokens");
  if (!user) {
    await import_bcryptjs.default.hash(password, SALT_ROUNDS);
    throw new UnauthorizedError("Invalid email or password");
  }
  if (user.accountStatus !== "active") {
    throw new UnauthorizedError("Account is not active. Please contact support.");
  }
  const isPasswordValid = await import_bcryptjs.default.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }
  user.lastLoginAt = /* @__PURE__ */ new Date();
  await user.save();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await addRefreshToken(user, refreshToken, meta);
  return { user, accessToken, refreshToken };
}
async function refreshTokens(incomingRefreshToken) {
  const tokenHash = hashToken(incomingRefreshToken);
  const user = await User.findOne({
    "refreshTokens.tokenHash": tokenHash,
    "refreshTokens.expiresAt": { $gt: /* @__PURE__ */ new Date() }
  }).select("+refreshTokens");
  if (!user) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
  if (user.accountStatus !== "active") {
    throw new UnauthorizedError("Account is suspended");
  }
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  const newRefreshToken = generateRefreshToken();
  await addRefreshToken(user, newRefreshToken);
  const accessToken = generateAccessToken(user);
  return { accessToken, newRefreshToken };
}
async function logout(userId, refreshToken) {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await User.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { tokenHash } } }
    );
  }
}
async function forgotPassword(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ normalizedEmail });
  if (!user || !user.emailVerified) return;
  const resetToken = generateSecureToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1e3);
  await User.updateOne(
    { _id: user._id },
    {
      passwordResetToken: hashToken(resetToken),
      passwordResetExpiry: resetExpiry
    }
  );
  sendPasswordResetEmail(user.email, user.name, resetToken).catch(
    (err) => logger.error("Failed to send password reset email:", { userId: user._id, error: err.message })
  );
}
async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpiry: { $gt: /* @__PURE__ */ new Date() }
  }).select("+passwordHash");
  if (!user) {
    throw new AppError("Invalid or expired password reset token", 400, { code: "INVALID_TOKEN" });
  }
  const passwordHash = await import_bcryptjs.default.hash(newPassword, SALT_ROUNDS);
  await User.updateOne(
    { _id: user._id },
    {
      passwordHash,
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
      refreshTokens: []
      // Invalidate all sessions
    }
  );
}
async function verifyEmail(token) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpiry: { $gt: /* @__PURE__ */ new Date() }
  }).select("+emailVerificationToken +emailVerificationExpiry");
  if (!user) {
    throw new AppError("Invalid or expired verification token", 400, { code: "INVALID_TOKEN" });
  }
  await User.updateOne(
    { _id: user._id },
    {
      emailVerified: true,
      $unset: { emailVerificationToken: 1, emailVerificationExpiry: 1 }
    }
  );
}
async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  if (user.accountStatus === "deleted") throw new UnauthorizedError();
  return user;
}
async function addRefreshToken(user, rawToken, meta) {
  const tokenHash = hashToken(rawToken);
  const expiresAt = /* @__PURE__ */ new Date();
  const expiryStr = REFRESH_EXPIRY;
  const match = expiryStr.match(/^(\d+)([smhd])$/);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = match[2];
    const msMap = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
    expiresAt.setTime(expiresAt.getTime() + val * msMap[unit]);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }
  const validTokens = (user.refreshTokens || []).filter((t) => t.expiresAt > /* @__PURE__ */ new Date());
  const tokens = validTokens.slice(-4);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        refreshTokens: [
          ...tokens,
          {
            tokenHash,
            createdAt: /* @__PURE__ */ new Date(),
            expiresAt,
            userAgent: meta?.userAgent,
            ipAddress: meta?.ipAddress
          }
        ]
      }
    }
  );
}

// src/common/utils/response.ts
function successResponse(res, data, options = {}) {
  return res.status(options.statusCode ?? 200).json({
    success: true,
    ...options.message ? { message: options.message } : {},
    data,
    ...options.meta ? { meta: options.meta } : {}
  });
}
function paginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// src/modules/auth/auth.controller.ts
var COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: "/"
};
var ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1e3;
var REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1e3;
async function register2(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await register(req.body);
    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });
    successResponse(res, { user, accessToken, refreshToken }, { statusCode: 201, message: "Account created. Please verify your email." });
  } catch (err) {
    next(err);
  }
}
async function login2(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await login(
      req.body.email,
      req.body.password,
      {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip
      }
    );
    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });
    successResponse(res, { user, accessToken, refreshToken }, { message: "Login successful" });
  } catch (err) {
    next(err);
  }
}
async function logout2(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const userId = req.user?.userId;
    if (userId) {
      await logout(userId, refreshToken);
    }
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    successResponse(res, null, { message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}
async function refresh(req, res, next) {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
      res.status(401).json({ success: false, error: "No refresh token provided", code: "UNAUTHORIZED" });
      return;
    }
    const { accessToken, newRefreshToken } = await refreshTokens(incomingRefreshToken);
    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie("refreshToken", newRefreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });
    successResponse(res, { accessToken, refreshToken: newRefreshToken }, { message: "Token refreshed" });
  } catch (err) {
    next(err);
  }
}
async function forgotPassword2(req, res, next) {
  try {
    await forgotPassword(req.body.email);
    successResponse(res, null, {
      message: "If an account with that email exists, a password reset link has been sent."
    });
  } catch (err) {
    next(err);
  }
}
async function resetPassword2(req, res, next) {
  try {
    await resetPassword(req.body.token, req.body.password);
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    successResponse(res, null, { message: "Password reset successful. Please log in again." });
  } catch (err) {
    next(err);
  }
}
async function verifyEmail2(req, res, next) {
  try {
    await verifyEmail(req.body.token);
    successResponse(res, null, { message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
}
async function me(req, res, next) {
  try {
    const user = await getMe(req.user.userId);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}

// src/common/middleware/validate.ts
function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true
      });
    } else {
      req[source] = result.data;
    }
    next();
  };
}

// src/common/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
init_config();
init_AppError();
function authenticate(req, _res, next) {
  const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : void 0);
  if (!token) {
    next(new UnauthorizedError());
    return;
  }
  try {
    const payload = import_jsonwebtoken2.default.verify(token, config.jwt.accessSecret);
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}
function optionalAuth(req, _res, next) {
  const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : void 0);
  if (token) {
    try {
      const payload = import_jsonwebtoken2.default.verify(token, config.jwt.accessSecret);
      req.user = payload;
    } catch {
    }
  }
  next();
}
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Role '${req.user.role}' cannot access this resource`));
      return;
    }
    next();
  };
}

// src/modules/auth/auth.validators.ts
var import_zod2 = require("zod");
var phoneRegex = /^(?:\+92|92|0)?3[0-9]{2}[0-9]{7}$|^\+?[1-9]\d{6,14}$/;
var phoneErrorMessage = "Please enter a valid phone number (e.g. 03001234567 or +923001234567)";
var passwordSchema = import_zod2.z.string().min(8, "Password must be at least 8 characters long").max(128, "Password cannot exceed 128 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)").regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)").regex(/[0-9]/, "Password must contain at least one number (0-9)").regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%^&*)");
var registerSchema = import_zod2.z.object({
  name: import_zod2.z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: import_zod2.z.string().trim().email("Please enter a valid email address (e.g. name@example.com)").toLowerCase(),
  password: passwordSchema,
  phone: import_zod2.z.string().trim().regex(phoneRegex, phoneErrorMessage).optional()
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: import_zod2.z.string().min(1, "Password cannot be blank")
});
var forgotPasswordSchema = import_zod2.z.object({
  email: import_zod2.z.string().trim().email("Please enter a valid email address").toLowerCase()
});
var resetPasswordSchema = import_zod2.z.object({
  token: import_zod2.z.string().min(1, "Token cannot be blank"),
  password: passwordSchema
});
var verifyEmailSchema = import_zod2.z.object({
  token: import_zod2.z.string().min(1, "Token cannot be blank")
});
var changePasswordSchema = import_zod2.z.object({
  currentPassword: import_zod2.z.string().min(1, "Current password is required"),
  newPassword: passwordSchema
});

// src/modules/auth/auth.routes.ts
var authRouter = (0, import_express2.Router)();
authRouter.post("/register", authLimiter, validate(registerSchema), register2);
authRouter.post("/login", authLimiter, validate(loginSchema), login2);
authRouter.post("/logout", authenticate, logout2);
authRouter.post("/refresh", refresh);
authRouter.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword2);
authRouter.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword2);
authRouter.post("/verify-email", validate(verifyEmailSchema), verifyEmail2);
authRouter.get("/me", authenticate, me);

// src/modules/users/user.routes.ts
var import_express3 = require("express");

// src/modules/users/user.service.ts
init_models();
init_AppError();
async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  return user;
}
async function updateProfile(userId, data) {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
  if (!user) throw new NotFoundError("User");
  return user;
}
async function changePassword(userId, currentPass, newPass) {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new NotFoundError("User");
  const bcrypt2 = await import("bcryptjs");
  const valid = await bcrypt2.compare(currentPass, user.passwordHash);
  if (!valid) {
    const { ValidationError: ValidationError2 } = await Promise.resolve().then(() => (init_AppError(), AppError_exports));
    throw new ValidationError2("Current password is incorrect");
  }
  const { config: config2 } = await Promise.resolve().then(() => (init_config(), config_exports));
  user.passwordHash = await bcrypt2.hash(newPass, config2.bcrypt.saltRounds);
  await user.save();
}
async function getAddresses(userId) {
  const user = await User.findById(userId).select("addresses");
  if (!user) throw new NotFoundError("User");
  return user.addresses;
}
async function addAddress(userId, address) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  if (address.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  user.addresses.push(address);
  return user.save();
}
async function updateAddress(userId, addressId, data) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  const addrIdx = user.addresses.findIndex((a) => a._id?.toString() === addressId);
  if (addrIdx < 0) throw new NotFoundError("Address");
  if (data.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  Object.assign(user.addresses[addrIdx], data);
  return user.save();
}
async function deleteAddress(userId, addressId) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  user.addresses = user.addresses.filter((a) => a._id?.toString() !== addressId);
  return user.save();
}
async function getOrderHistory(userId, page, limit) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-statusHistory -metadata"),
    Order.countDocuments({ user: userId })
  ]);
  return { orders, meta: paginationMeta(page, limit, total) };
}
async function getOrderDetail(userId, orderNumber) {
  const order = await Order.findOne({ orderNumber, user: userId });
  if (!order) throw new NotFoundError("Order");
  return order;
}

// src/modules/users/user.controller.ts
async function getProfile2(req, res, next) {
  try {
    const user = await getProfile(req.user.userId);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}
async function updateProfile2(req, res, next) {
  try {
    const user = await updateProfile(req.user.userId, req.body);
    successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}
async function getAddresses2(req, res, next) {
  try {
    const addresses = await getAddresses(req.user.userId);
    successResponse(res, { addresses });
  } catch (err) {
    next(err);
  }
}
async function addAddress2(req, res, next) {
  try {
    const user = await addAddress(req.user.userId, req.body);
    successResponse(res, { addresses: user.addresses }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}
async function updateAddress2(req, res, next) {
  try {
    const user = await updateAddress(
      req.user.userId,
      req.params.addressId,
      req.body
    );
    successResponse(res, { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}
async function deleteAddress2(req, res, next) {
  try {
    const user = await deleteAddress(req.user.userId, req.params.addressId);
    successResponse(res, { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}
async function getOrderHistory2(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "10", 10)));
    const result = await getOrderHistory(req.user.userId, page, limit);
    successResponse(res, { orders: result.orders }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}
async function getOrderDetail2(req, res, next) {
  try {
    const order = await getOrderDetail(req.user.userId, req.params.orderNumber);
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}
async function changePassword2(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.user.userId, currentPassword, newPassword);
    successResponse(res, null, { message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}

// src/modules/users/user.validators.ts
var import_zod3 = require("zod");
var updateProfileSchema = import_zod3.z.object({
  name: import_zod3.z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: import_zod3.z.string().trim().optional(),
  avatarUrl: import_zod3.z.string().trim().optional()
});
var changePasswordSchema2 = import_zod3.z.object({
  currentPassword: import_zod3.z.string().min(1, "Current password is required"),
  newPassword: import_zod3.z.string().min(8, "New password must be at least 8 characters long")
});
var addressSchema2 = import_zod3.z.object({
  label: import_zod3.z.string().trim().default("home"),
  fullName: import_zod3.z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: import_zod3.z.string().trim().regex(phoneRegex, phoneErrorMessage),
  addressLine1: import_zod3.z.string().trim().min(5, "Address must be at least 5 characters").max(200),
  addressLine2: import_zod3.z.string().trim().max(200).optional(),
  city: import_zod3.z.string().trim().min(2, "City must be at least 2 characters").max(100),
  state: import_zod3.z.string().trim().optional(),
  postalCode: import_zod3.z.string().trim().regex(/^[0-9]{4,6}$/, "Postal code must be 4 to 6 numeric digits (e.g. 54000)").optional(),
  country: import_zod3.z.string().length(2, "Country must be a 2-letter ISO code (e.g. PK)").toUpperCase().default("PK"),
  isDefault: import_zod3.z.boolean().default(false)
});
var addAddressSchema = addressSchema2;
var updateAddressSchema = addressSchema2.partial();

// src/modules/users/user.routes.ts
var userRouter = (0, import_express3.Router)();
userRouter.use(authenticate);
userRouter.get("/profile", getProfile2);
userRouter.patch("/profile", validate(updateProfileSchema), updateProfile2);
userRouter.post("/change-password", validate(changePasswordSchema2), changePassword2);
userRouter.get("/addresses", getAddresses2);
userRouter.post("/addresses", validate(addAddressSchema), addAddress2);
userRouter.patch("/addresses/:addressId", validate(updateAddressSchema), updateAddress2);
userRouter.delete("/addresses/:addressId", deleteAddress2);
userRouter.get("/orders", getOrderHistory2);
userRouter.get("/orders/:orderNumber", getOrderDetail2);

// src/modules/products/product.routes.ts
var import_express4 = require("express");

// src/modules/products/product.service.ts
var import_mongoose19 = __toESM(require("mongoose"));
init_models();
init_AppError();

// src/common/utils/slugify.ts
function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function generateOrderNumber() {
  const timestamp2 = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVE-${timestamp2}-${random}`;
}

// src/modules/products/product.service.ts
async function getProducts(query, isAdmin = false) {
  const filter = {};
  if (!isAdmin || !query.includeInactive) filter.isActive = true;
  if (query.category) {
    if (import_mongoose19.default.isValidObjectId(query.category)) {
      filter.category = new import_mongoose19.default.Types.ObjectId(query.category);
    } else {
      const catSlug = query.category.toLowerCase().trim();
      const matchedCat = await Category.findOne({
        $or: [
          { slug: catSlug },
          { slug: `electric-${catSlug}` },
          { slug: `ev-${catSlug}` },
          { slug: { $regex: catSlug.replace(/s$/, ""), $options: "i" } }
        ]
      });
      if (matchedCat) {
        filter.category = matchedCat._id;
      } else {
        const typeMatch = catSlug.replace(/s$/, "").toLowerCase();
        if (["motorcycle", "scooter", "accessory", "part"].includes(typeMatch)) {
          filter.productType = typeMatch;
        }
      }
    }
  }
  if (query.productType) filter.productType = query.productType;
  if (query.featured) filter.isFeatured = true;
  if (query.minPrice !== void 0 || query.maxPrice !== void 0) {
    const priceFilter = {};
    if (query.minPrice !== void 0) priceFilter.$gte = query.minPrice;
    if (query.maxPrice !== void 0) priceFilter.$lte = query.maxPrice;
    filter.basePrice = priceFilter;
  }
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.color) {
    filter["colorVariants.name"] = { $regex: query.color, $options: "i" };
  }
  const sortMap = {
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest: { createdAt: -1 },
    popular: { soldCount: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
    rating: { averageRating: -1 }
  };
  const sort = sortMap[query.sort || "newest"] || sortMap.newest;
  const skip = (query.page - 1) * query.limit;
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(query.limit).populate("category", "name slug"),
    Product.countDocuments(filter)
  ]);
  return { products, meta: paginationMeta(query.page, query.limit, total) };
}
async function getProductBySlug(slug, isAdmin = false) {
  const filter = { slug };
  if (!isAdmin) filter.isActive = true;
  const product = await Product.findOne(filter).populate("category", "name slug");
  if (!product) throw new NotFoundError("Product");
  return product;
}
async function getFeaturedProducts(limit = 8) {
  return Product.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 }).limit(limit).populate("category", "name slug");
}
async function getRelatedProducts(productId, limit = 6) {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product");
  return Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: [
      { category: product.category },
      { productType: product.productType },
      { tags: { $in: product.tags } }
    ]
  }).limit(limit);
}
async function createProduct(data) {
  const slug = data.slug || slugify(data.name);
  let categoryId;
  if (data.category && import_mongoose19.default.isValidObjectId(data.category)) {
    const category = await Category.findById(data.category);
    if (!category) throw new NotFoundError("Category");
    categoryId = category._id;
  } else {
    const matchedCategory = await Category.findOne(
      data.productType === "accessory" || data.productType === "part" ? { slug: "ev-accessories" } : { slug: "electric-motorcycles" }
    ) || await Category.findOne();
    if (!matchedCategory) throw new NotFoundError("No default category found in database");
    categoryId = matchedCategory._id;
  }
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) throw new ConflictError("Product with this slug already exists");
  const existingSku = await Product.findOne({ sku: data.sku });
  if (existingSku) throw new ConflictError("Product with this SKU already exists");
  return Product.create({
    ...data,
    slug,
    category: categoryId
  });
}
async function updateProduct(id, data) {
  const product = await Product.findById(id);
  if (!product) throw new NotFoundError("Product");
  if (data.slug && data.slug !== product.slug) {
    const exists = await Product.findOne({ slug: data.slug, _id: { $ne: id } });
    if (exists) throw new ConflictError("Slug already in use");
  }
  if (data.sku && data.sku !== product.sku) {
    const exists = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
    if (exists) throw new ConflictError("SKU already in use");
  }
  if (data.category) {
    const category = await Category.findById(data.category);
    if (!category) throw new NotFoundError("Category");
    product.category = new import_mongoose19.default.Types.ObjectId(data.category);
  }
  const { category: _cat, ...otherUpdates } = data;
  Object.assign(product, otherUpdates);
  return product.save();
}
async function archiveProduct(id) {
  const result = await Product.findByIdAndUpdate(id, { isActive: false });
  if (!result) throw new NotFoundError("Product");
}
async function deleteProduct(id) {
  const result = await Product.findByIdAndDelete(id);
  if (!result) throw new NotFoundError("Product");
}

// src/modules/products/product.validators.ts
var import_zod4 = require("zod");
var specificationSchema2 = import_zod4.z.object({
  key: import_zod4.z.string().trim().min(1, "Specification key cannot be empty"),
  label: import_zod4.z.string().trim().min(1, "Specification label cannot be empty"),
  value: import_zod4.z.string().trim().min(1, "Specification value cannot be empty"),
  unit: import_zod4.z.string().trim().optional(),
  group: import_zod4.z.string().trim().default("General")
});
var colorVariantSchema2 = import_zod4.z.object({
  name: import_zod4.z.string().trim().min(1, "Variant name cannot be empty"),
  colorHex: import_zod4.z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color code (e.g. #00d4aa or #fff)"),
  images: import_zod4.z.array(import_zod4.z.string().url("Images must be valid URLs")).default([]),
  sku: import_zod4.z.string().trim().toUpperCase().regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "SKU must be uppercase alphanumeric with hyphens (e.g. EVE-M125-PRO-BLK)"),
  additionalPrice: import_zod4.z.number().int("Price must be an integer (in paisa)").min(0, "Additional price must be non-negative").default(0),
  inventory: import_zod4.z.number().int("Inventory must be an integer").min(0, "Inventory cannot be negative").default(0),
  isActive: import_zod4.z.boolean().default(true)
});
var createProductSchema = import_zod4.z.object({
  name: import_zod4.z.string().trim().min(2, "Product name must be at least 2 characters").max(200, "Product name cannot exceed 200 characters"),
  slug: import_zod4.z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. evee-pro-125)").optional(),
  sku: import_zod4.z.string().trim().toUpperCase().min(2, "SKU must be at least 2 characters").max(50, "SKU cannot exceed 50 characters").regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "Base SKU must be uppercase alphanumeric with hyphens (e.g. EVE-M125-PRO)"),
  description: import_zod4.z.string().trim().min(10, "Description must be at least 10 characters"),
  shortDescription: import_zod4.z.string().trim().max(500, "Short description cannot exceed 500 characters").optional(),
  category: import_zod4.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ObjectId format").optional(),
  brand: import_zod4.z.string().trim().default("EVee"),
  productType: import_zod4.z.enum(["motorcycle", "scooter", "accessory", "part"]),
  basePrice: import_zod4.z.number().int("Price must be an integer in currency subunits (paisa)").min(0, "Price must be non-negative"),
  compareAtPrice: import_zod4.z.number().int("Compare-at price must be an integer in paisa").min(0).optional(),
  currency: import_zod4.z.string().length(3).toUpperCase().default("PKR"),
  images: import_zod4.z.array(import_zod4.z.string().trim()).default([]),
  specifications: import_zod4.z.array(specificationSchema2).default([]),
  colorVariants: import_zod4.z.array(colorVariantSchema2).default([]),
  inventory: import_zod4.z.number().int().min(0, "Inventory cannot be negative").default(0),
  inventoryPolicy: import_zod4.z.enum(["track", "preorder", "unlimited"]).default("track"),
  weight: import_zod4.z.number().positive("Weight must be positive").optional(),
  dimensions: import_zod4.z.object({
    length: import_zod4.z.number().positive(),
    width: import_zod4.z.number().positive(),
    height: import_zod4.z.number().positive()
  }).optional(),
  isActive: import_zod4.z.boolean().default(true),
  isFeatured: import_zod4.z.boolean().default(false),
  tags: import_zod4.z.array(import_zod4.z.string().trim()).default([]),
  seoTitle: import_zod4.z.string().trim().max(70, "SEO title cannot exceed 70 characters").optional(),
  seoDescription: import_zod4.z.string().trim().max(160, "SEO description cannot exceed 160 characters").optional(),
  seoKeywords: import_zod4.z.array(import_zod4.z.string().trim()).default([])
});
var updateProductSchema = createProductSchema.partial();
var productQuerySchema = import_zod4.z.object({
  page: import_zod4.z.string().optional().transform((v) => Math.max(1, parseInt(v || "1", 10))),
  limit: import_zod4.z.string().optional().transform((v) => Math.min(50, Math.max(1, parseInt(v || "12", 10)))),
  category: import_zod4.z.string().optional(),
  productType: import_zod4.z.enum(["motorcycle", "scooter", "accessory", "part"]).optional(),
  minPrice: import_zod4.z.string().optional().transform((v) => v ? parseInt(v, 10) : void 0),
  maxPrice: import_zod4.z.string().optional().transform((v) => v ? parseInt(v, 10) : void 0),
  color: import_zod4.z.string().optional(),
  sort: import_zod4.z.enum(["price_asc", "price_desc", "newest", "popular", "featured", "rating"]).optional().default("newest"),
  search: import_zod4.z.string().trim().optional(),
  featured: import_zod4.z.string().optional().transform((v) => v === "true"),
  includeInactive: import_zod4.z.string().optional().transform((v) => v === "true")
});

// src/modules/products/product.controller.ts
async function getProducts2(req, res, next) {
  try {
    const query = productQuerySchema.parse(req.query);
    const isAdmin = req.user?.role === "admin";
    const result = await getProducts(query, isAdmin);
    successResponse(res, { products: result.products }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}
async function getProductBySlug2(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const product = await getProductBySlug(req.params.slug, isAdmin);
    successResponse(res, { product });
  } catch (err) {
    next(err);
  }
}
async function getFeaturedProducts2(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || "8", 10);
    const products = await getFeaturedProducts(Math.min(limit, 20));
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}
async function getRelatedProducts2(req, res, next) {
  try {
    const products = await getRelatedProducts(req.params.id);
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}
async function createProduct2(req, res, next) {
  try {
    const product = await createProduct(req.body);
    successResponse(res, { product }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}
async function updateProduct2(req, res, next) {
  try {
    const product = await updateProduct(req.params.id, req.body);
    successResponse(res, { product });
  } catch (err) {
    next(err);
  }
}
async function archiveProduct2(req, res, next) {
  try {
    await archiveProduct(req.params.id);
    successResponse(res, null, { message: "Product archived" });
  } catch (err) {
    next(err);
  }
}
async function deleteProduct2(req, res, next) {
  try {
    await deleteProduct(req.params.id);
    successResponse(res, null, { message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

// src/modules/products/product.routes.ts
var productRouter = (0, import_express4.Router)();
productRouter.get("/", optionalAuth, getProducts2);
productRouter.get("/featured", getFeaturedProducts2);
productRouter.get("/search", searchLimiter, optionalAuth, getProducts2);
productRouter.get("/:id/related", getRelatedProducts2);
productRouter.get("/:slug", optionalAuth, getProductBySlug2);
productRouter.post("/", authenticate, authorize("admin"), validate(createProductSchema), createProduct2);
productRouter.patch("/:id", authenticate, authorize("admin"), validate(updateProductSchema), updateProduct2);
productRouter.patch("/:id/archive", authenticate, authorize("admin"), archiveProduct2);
productRouter.delete("/:id", authenticate, authorize("admin"), deleteProduct2);

// src/modules/categories/category.routes.ts
var import_express5 = require("express");

// src/modules/categories/category.service.ts
init_models();
init_AppError();
async function getCategories(options) {
  const filter = {};
  if (!options.includeInactive) filter.isActive = true;
  if (options.parent !== void 0) filter.parent = options.parent || null;
  return Category.find(filter).sort({ sortOrder: 1, name: 1 });
}
async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) throw new NotFoundError("Category");
  return category;
}
async function createCategory(data) {
  const slug = data.slug || slugify(data.name);
  const existing = await Category.findOne({ slug });
  if (existing) throw new ConflictError("Category with this slug already exists");
  return Category.create({ ...data, slug });
}
async function updateCategory(id, data) {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError("Category");
  if (data.slug && data.slug !== category.slug) {
    const exists = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
    if (exists) throw new ConflictError("Category with this slug already exists");
  }
  Object.assign(category, data);
  return category.save();
}
async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError("Category");
  category.isActive = false;
  await category.save();
}

// src/modules/categories/category.controller.ts
async function getCategories2(req, res, next) {
  try {
    const includeInactive = req.query.includeInactive === "true" && req.user?.role === "admin";
    const parent = req.query.parent;
    const categories = await getCategories({ includeInactive, parent });
    successResponse(res, { categories });
  } catch (err) {
    next(err);
  }
}
async function getCategoryBySlug2(req, res, next) {
  try {
    const category = await getCategoryBySlug(req.params.slug);
    successResponse(res, { category });
  } catch (err) {
    next(err);
  }
}
async function createCategory2(req, res, next) {
  try {
    const category = await createCategory(req.body);
    successResponse(res, { category }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}
async function updateCategory2(req, res, next) {
  try {
    const category = await updateCategory(req.params.id, req.body);
    successResponse(res, { category });
  } catch (err) {
    next(err);
  }
}
async function deleteCategory2(req, res, next) {
  try {
    await deleteCategory(req.params.id);
    successResponse(res, null, { message: "Category deactivated" });
  } catch (err) {
    next(err);
  }
}

// src/modules/categories/category.validators.ts
var import_zod5 = require("zod");
var createCategorySchema = import_zod5.z.object({
  name: import_zod5.z.string().trim().min(2, "Category name must be at least 2 characters").max(100, "Category name cannot exceed 100 characters"),
  slug: import_zod5.z.string().trim().toLowerCase().regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase alphanumeric with hyphens (e.g. electric-motorcycles)"
  ).optional(),
  description: import_zod5.z.string().trim().max(1e3).optional(),
  image: import_zod5.z.string().url("Category image must be a valid URL").optional(),
  parent: import_zod5.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid parent Category ObjectId format").optional(),
  isActive: import_zod5.z.boolean().default(true),
  sortOrder: import_zod5.z.number().int().min(0, "Sort order must be non-negative").default(0),
  seoTitle: import_zod5.z.string().trim().max(70, "SEO title cannot exceed 70 characters").optional(),
  seoDescription: import_zod5.z.string().trim().max(160, "SEO description cannot exceed 160 characters").optional()
});
var updateCategorySchema = createCategorySchema.partial();
var categoryQuerySchema = import_zod5.z.object({
  includeInactive: import_zod5.z.string().optional().transform((v) => v === "true"),
  parent: import_zod5.z.string().optional()
});

// src/modules/categories/category.routes.ts
var categoryRouter = (0, import_express5.Router)();
categoryRouter.get("/", optionalAuth, getCategories2);
categoryRouter.get("/:slug", getCategoryBySlug2);
categoryRouter.post("/", authenticate, authorize("admin"), validate(createCategorySchema), createCategory2);
categoryRouter.patch("/:id", authenticate, authorize("admin"), validate(updateCategorySchema), updateCategory2);
categoryRouter.delete("/:id", authenticate, authorize("admin"), deleteCategory2);

// src/modules/cart/cart.routes.ts
var import_express6 = require("express");

// src/modules/cart/cart.service.ts
var import_mongoose20 = __toESM(require("mongoose"));
init_models();
init_AppError();

// src/common/utils/decimal.ts
var import_decimal = __toESM(require("decimal.js"));
import_decimal.default.set({ precision: 20, rounding: import_decimal.default.ROUND_HALF_UP });
function fromSubunit(amount, subunit = 100) {
  return new import_decimal.default(amount).div(subunit).toFixed(2);
}
function addSubunit(...amounts) {
  return amounts.reduce((acc, a) => new import_decimal.default(acc).add(a).toNumber(), 0);
}

// src/modules/cart/cart.service.ts
async function getOrCreateCart(userId, sessionId) {
  if (!userId && !sessionId) throw new AppError("Cart identifier required", 400);
  const filter = userId ? { user: new import_mongoose20.default.Types.ObjectId(userId) } : { sessionId };
  let cart = await Cart.findOne(filter);
  if (!cart) {
    cart = await Cart.create({
      user: userId ? new import_mongoose20.default.Types.ObjectId(userId) : void 0,
      sessionId: userId ? void 0 : sessionId,
      items: []
    });
  }
  return cart;
}
async function refreshCartPrices(cart) {
  const productIds = [...new Set(cart.items.map((i) => i.product.toString()))];
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const validItems = [];
  for (const item of cart.items) {
    const product = productMap.get(item.product.toString());
    if (!product) continue;
    let unitPrice = product.basePrice;
    let variantName;
    let variantColorHex;
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
    const itemObj = item.toObject ? item.toObject() : item;
    validItems.push({
      ...itemObj,
      productName: product.name,
      sku,
      unitPrice,
      variantName,
      variantColorHex,
      image
    });
  }
  cart.items = validItems;
  return cart;
}
async function addItem(userId, sessionId, productId, variantId, quantity) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new NotFoundError("Product");
  let unitPrice = product.basePrice;
  let variantName;
  let variantColorHex;
  let sku = product.sku;
  let image = product.images[0];
  if (variantId) {
    const variant = product.colorVariants.find((v) => v._id?.toString() === variantId);
    if (!variant || !variant.isActive) throw new NotFoundError("Product variant");
    unitPrice = addSubunit(product.basePrice, variant.additionalPrice);
    variantName = variant.name;
    variantColorHex = variant.colorHex;
    sku = variant.sku;
    image = variant.images[0] || image;
  }
  if (product.inventoryPolicy === "track") {
    const available = variantId ? (product.colorVariants.find((v) => v._id?.toString() === variantId)?.inventory || 0) - (product.colorVariants.find((v) => v._id?.toString() === variantId)?.reservedInventory || 0) : product.inventory - product.reservedInventory;
    if (available < quantity) throw new InsufficientInventoryError(product.name);
  }
  const cart = await getOrCreateCart(userId, sessionId);
  const existingItemIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId && (variantId ? i.variantId?.toString() === variantId : !i.variantId)
  );
  if (existingItemIdx >= 0) {
    cart.items[existingItemIdx].quantity += quantity;
    cart.items[existingItemIdx].unitPrice = unitPrice;
  } else {
    cart.items.push({
      product: new import_mongoose20.default.Types.ObjectId(productId),
      variantId: variantId ? new import_mongoose20.default.Types.ObjectId(variantId) : void 0,
      quantity,
      productName: product.name,
      sku,
      unitPrice,
      variantName,
      variantColorHex,
      image
    });
  }
  return cart.save();
}
async function updateItem(userId, sessionId, itemId, quantity) {
  const cart = await getOrCreateCart(userId, sessionId);
  const itemIdx = cart.items.findIndex((i) => i._id?.toString() === itemId);
  if (itemIdx < 0) throw new NotFoundError("Cart item");
  if (quantity === 0) {
    cart.items.splice(itemIdx, 1);
  } else {
    cart.items[itemIdx].quantity = quantity;
  }
  return cart.save();
}
async function removeItem(userId, sessionId, itemId) {
  const cart = await getOrCreateCart(userId, sessionId);
  const itemIdx = cart.items.findIndex((i) => i._id?.toString() === itemId);
  if (itemIdx < 0) throw new NotFoundError("Cart item");
  cart.items.splice(itemIdx, 1);
  return cart.save();
}
async function clearCart(userId, sessionId) {
  const cart = await getOrCreateCart(userId, sessionId);
  cart.items = [];
  cart.couponCode = void 0;
  await cart.save();
}
async function getCartSummary(cart, couponCode) {
  const refreshed = await refreshCartPrices(cart);
  let subtotal = 0;
  for (const item of refreshed.items) {
    subtotal = addSubunit(subtotal, item.unitPrice * item.quantity);
  }
  let discountAmount = 0;
  let appliedCoupon;
  const code = couponCode || cart.couponCode;
  if (code) {
    try {
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startsAt: { $lte: /* @__PURE__ */ new Date() },
        $or: [{ expiresAt: null }, { expiresAt: { $gt: /* @__PURE__ */ new Date() } }]
      });
      if (coupon) {
        if (coupon.minimumOrderValue === 0 || subtotal >= coupon.minimumOrderValue) {
          if (coupon.discountType === "percentage") {
            discountAmount = Math.floor(subtotal * coupon.discountValue / 100);
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
    }
  }
  return {
    items: refreshed.items,
    subtotal,
    discountAmount,
    couponCode: appliedCoupon,
    estimatedTotal: Math.max(0, subtotal - discountAmount)
  };
}

// src/modules/cart/cart.controller.ts
function getCartIdentifiers(req) {
  return {
    userId: req.user?.userId,
    sessionId: req.user ? void 0 : req.headers["x-session-id"]
  };
}
async function getCart(req, res, next) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await getOrCreateCart(userId, sessionId);
    const summary = await getCartSummary(cart);
    successResponse(res, { cart: summary });
  } catch (err) {
    next(err);
  }
}
async function addItem2(req, res, next) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const { productId, variantId, quantity } = req.body;
    const cart = await addItem(userId, sessionId, productId, variantId, quantity);
    const summary = await getCartSummary(cart);
    successResponse(res, { cart: summary }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}
async function updateItem2(req, res, next) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await updateItem(
      userId,
      sessionId,
      req.params.itemId,
      req.body.quantity
    );
    const summary = await getCartSummary(cart);
    successResponse(res, { cart: summary });
  } catch (err) {
    next(err);
  }
}
async function removeItem2(req, res, next) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await removeItem(userId, sessionId, req.params.itemId);
    const summary = await getCartSummary(cart);
    successResponse(res, { cart: summary });
  } catch (err) {
    next(err);
  }
}
async function clearCart2(req, res, next) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    await clearCart(userId, sessionId);
    successResponse(res, null, { message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
}

// src/modules/cart/cart.validators.ts
var import_zod6 = require("zod");
var addCartItemSchema = import_zod6.z.object({
  productId: import_zod6.z.string().min(1),
  variantId: import_zod6.z.string().optional(),
  quantity: import_zod6.z.number().int().min(1).max(999)
});
var updateCartItemSchema = import_zod6.z.object({
  quantity: import_zod6.z.number().int().min(0).max(999)
  // 0 = remove
});
var applyCouponSchema = import_zod6.z.object({
  couponCode: import_zod6.z.string().trim().toUpperCase().min(1)
});

// src/modules/cart/cart.routes.ts
var cartRouter = (0, import_express6.Router)();
cartRouter.get("/", optionalAuth, getCart);
cartRouter.post("/items", optionalAuth, validate(addCartItemSchema), addItem2);
cartRouter.patch("/items/:itemId", optionalAuth, validate(updateCartItemSchema), updateItem2);
cartRouter.delete("/items/:itemId", optionalAuth, removeItem2);
cartRouter.delete("/", optionalAuth, clearCart2);

// src/modules/checkout/checkout.routes.ts
var import_express7 = require("express");

// src/modules/checkout/checkout.service.ts
var import_mongoose22 = __toESM(require("mongoose"));
var import_crypto2 = __toESM(require("crypto"));
init_models();
init_AppError();

// src/modules/inventory/inventory.service.ts
var import_mongoose21 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function reserveInventoryBatch(items, orderNumber) {
  const reservedSoFar = [];
  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new NotFoundError(`Product ${item.productId}`);
      if (product.inventoryPolicy === "unlimited" || product.inventoryPolicy === "preorder") {
        continue;
      }
      if (item.variantId) {
        const res = await Product.updateOne(
          {
            _id: item.productId,
            "colorVariants._id": item.variantId,
            $expr: {
              $gte: [
                {
                  $subtract: [
                    "$colorVariants.inventory",
                    "$colorVariants.reservedInventory"
                  ]
                },
                item.quantity
              ]
            }
          },
          {
            $inc: { "colorVariants.$.reservedInventory": item.quantity }
          }
        );
        if (res.modifiedCount === 0) {
          const p = await Product.findById(item.productId);
          const v = p?.colorVariants.find((cv) => cv._id?.toString() === item.variantId);
          const available = (v?.inventory || 0) - (v?.reservedInventory || 0);
          if (available < item.quantity) {
            throw new InsufficientInventoryError(product.name);
          }
          await Product.updateOne(
            { _id: item.productId, "colorVariants._id": item.variantId },
            { $inc: { "colorVariants.$.reservedInventory": item.quantity } }
          );
        }
      } else {
        const res = await Product.updateOne(
          {
            _id: item.productId,
            $expr: {
              $gte: [
                { $subtract: ["$inventory", "$reservedInventory"] },
                item.quantity
              ]
            }
          },
          {
            $inc: { reservedInventory: item.quantity }
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
    for (const reserved of reservedSoFar) {
      await releaseReservation(reserved.productId, reserved.variantId, reserved.quantity).catch(
        (err) => logger.error("Rollback reservation error:", err)
      );
    }
    throw error;
  }
}
async function releaseReservation(productId, variantId, quantity) {
  if (variantId) {
    await Product.updateOne(
      { _id: productId, "colorVariants._id": variantId },
      { $inc: { "colorVariants.$.reservedInventory": -quantity } }
    );
  } else {
    await Product.updateOne(
      { _id: productId },
      { $inc: { reservedInventory: -quantity } }
    );
  }
}
async function releaseOrderReservations(items) {
  for (const item of items) {
    const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
    const varId = item.variantId ? item.variantId.toString() : void 0;
    await releaseReservation(prodId, varId, item.quantity);
  }
}
async function commitOrderInventory(items, orderNumber) {
  for (const item of items) {
    const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
    const varId = item.variantId ? item.variantId.toString() : void 0;
    const product = await Product.findById(prodId);
    if (!product) continue;
    let balanceBefore = 0;
    let balanceAfter = 0;
    if (varId) {
      const v = product.colorVariants.find((cv) => cv._id?.toString() === varId);
      balanceBefore = v?.inventory || 0;
      balanceAfter = Math.max(0, balanceBefore - item.quantity);
      await Product.updateOne(
        { _id: prodId, "colorVariants._id": varId },
        {
          $inc: {
            "colorVariants.$.inventory": -item.quantity,
            "colorVariants.$.reservedInventory": -item.quantity
          }
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
            soldCount: item.quantity
          }
        }
      );
    }
    await InventoryMovement.create({
      product: new import_mongoose21.default.Types.ObjectId(prodId),
      variantId: varId ? new import_mongoose21.default.Types.ObjectId(varId) : void 0,
      sku: item.sku,
      movementType: "sale",
      quantity: -item.quantity,
      balanceBefore,
      balanceAfter,
      reference: orderNumber,
      note: `Fulfilled order ${orderNumber}`
    });
  }
}
async function adjustInventory(params) {
  const product = await Product.findById(params.productId);
  if (!product) throw new NotFoundError("Product");
  let balanceBefore = 0;
  let balanceAfter = 0;
  if (params.variantId) {
    const v = product.colorVariants.find((cv) => cv._id?.toString() === params.variantId);
    if (!v) throw new NotFoundError("Variant");
    balanceBefore = v.inventory;
    balanceAfter = Math.max(0, balanceBefore + params.quantityDelta);
    await Product.updateOne(
      { _id: params.productId, "colorVariants._id": params.variantId },
      { $set: { "colorVariants.$.inventory": balanceAfter } }
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
    product: new import_mongoose21.default.Types.ObjectId(params.productId),
    variantId: params.variantId ? new import_mongoose21.default.Types.ObjectId(params.variantId) : void 0,
    sku: params.sku,
    movementType: params.movementType,
    quantity: params.quantityDelta,
    balanceBefore,
    balanceAfter,
    note: params.note,
    performedBy: new import_mongoose21.default.Types.ObjectId(params.performedBy)
  });
}

// src/modules/payments/providers/index.ts
init_config();

// src/modules/payments/providers/stripe/stripe.provider.ts
var import_stripe = __toESM(require("stripe"));
init_config();
init_AppError();

// src/common/utils/retryWithBackoff.ts
async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    maxDelayMs = 3e4,
    factor = 2,
    jitter = true,
    retryOn = isRetryableError
  } = options;
  let lastError;
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !retryOn(error)) {
        throw error;
      }
      const actualDelay = jitter ? delay * (0.5 + Math.random() * 0.5) : delay;
      logger.warn(`Attempt ${attempt} failed, retrying in ${Math.round(actualDelay)}ms`, {
        error: error instanceof Error ? error.message : String(error)
      });
      await sleep(Math.min(actualDelay, maxDelayMs));
      delay = Math.min(delay * factor, maxDelayMs);
    }
  }
  throw lastError;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function isRetryableError(error) {
  if (error instanceof Error) {
    if (error.statusCode === 429) return true;
    if (error.code === "ECONNRESET") return true;
    if (error.code === "ECONNREFUSED") return true;
    if (error.statusCode === 503) return true;
    if (error.statusCode === 502) return true;
  }
  return false;
}

// src/modules/payments/providers/stripe/stripe.provider.ts
var StripePaymentProvider = class {
  providerName = "stripe";
  stripe;
  constructor() {
    this.stripe = new import_stripe.default(config.stripe.secretKey || "dummy_key_for_initialization", {
      apiVersion: "2025-02-24.acacia"
    });
  }
  async createCheckout(options) {
    const isPlaceholder = !config.stripe.secretKey || config.stripe.secretKey.startsWith("sk_test_placeholder") || config.stripe.secretKey === "sk_test_..." || config.stripe.secretKey === "dummy_key_for_initialization";
    if (isPlaceholder) {
      logger.info(
        `[STRIPE TEST MODE] Generating interactive Stripe payment page for order ${options.orderNumber}`
      );
      const testSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const checkoutUrl = `${config.server.frontendUrl}/checkout/pay?session_id=${testSessionId}&order_number=${options.orderNumber}&amount=${options.grandTotal}&currency=${options.currency}`;
      return {
        sessionId: testSessionId,
        checkoutUrl,
        provider: this.providerName,
        expiresAt: new Date(Date.now() + 30 * 60 * 1e3)
      };
    }
    const lineItems = options.items.map((item) => ({
      price_data: {
        currency: options.currency.toLowerCase(),
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images && item.images.length > 0 ? [item.images[0]] : void 0
        },
        unit_amount: item.unitAmount
      },
      quantity: item.quantity
    }));
    if (options.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: options.currency.toLowerCase(),
          product_data: {
            name: "Shipping Fee",
            description: "Delivery charge"
          },
          unit_amount: options.shippingFee
        },
        quantity: 1
      });
    }
    if (options.taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: options.currency.toLowerCase(),
          product_data: {
            name: "Tax / GST"
          },
          unit_amount: options.taxAmount
        },
        quantity: 1
      });
    }
    const sessionParams = {
      mode: "payment",
      line_items: lineItems,
      customer_email: options.customer.email,
      client_reference_id: options.orderNumber,
      metadata: {
        orderId: options.orderId,
        orderNumber: options.orderNumber,
        ...options.metadata
      },
      success_url: config.stripe.successUrl.replace("{CHECKOUT_SESSION_ID}", "{CHECKOUT_SESSION_ID}"),
      cancel_url: config.stripe.cancelUrl
    };
    const session = await retryWithBackoff(
      () => this.stripe.checkout.sessions.create(
        sessionParams,
        options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : void 0
      ),
      { maxAttempts: 3 }
    );
    if (!session.url) {
      throw new PaymentError("Failed to generate Stripe checkout URL");
    }
    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      provider: this.providerName,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1e3) : void 0
    };
  }
  async verifyWebhook(eventPayload) {
    if (!config.stripe.webhookSecret) {
      throw new PaymentError("Stripe webhook secret not configured");
    }
    if (!eventPayload.signature) {
      throw new PaymentError("Missing Stripe webhook signature");
    }
    let stripeEvent;
    try {
      stripeEvent = this.stripe.webhooks.constructEvent(
        eventPayload.rawBody,
        eventPayload.signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      logger.error("Stripe webhook signature verification failed:", err.message);
      throw new PaymentError(`Invalid webhook signature: ${err.message}`);
    }
    let status = "unknown";
    let orderNumber;
    let paymentIntentId;
    let chargeId;
    let amount;
    let currency;
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        status = session.payment_status === "paid" ? "paid" : "unknown";
        orderNumber = session.client_reference_id || session.metadata?.orderNumber;
        paymentIntentId = session.payment_intent;
        amount = session.amount_total || void 0;
        currency = session.currency?.toUpperCase();
        break;
      }
      case "payment_intent.succeeded": {
        const intent = stripeEvent.data.object;
        status = "paid";
        orderNumber = intent.metadata?.orderNumber;
        paymentIntentId = intent.id;
        amount = intent.amount_received;
        currency = intent.currency.toUpperCase();
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = stripeEvent.data.object;
        status = "failed";
        orderNumber = intent.metadata?.orderNumber;
        paymentIntentId = intent.id;
        break;
      }
      case "charge.refunded": {
        const charge = stripeEvent.data.object;
        status = "refunded";
        chargeId = charge.id;
        paymentIntentId = charge.payment_intent;
        amount = charge.amount_refunded;
        currency = charge.currency.toUpperCase();
        break;
      }
      default:
        status = "unknown";
    }
    return {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      provider: this.providerName,
      orderNumber,
      paymentIntentId,
      chargeId,
      amount,
      currency,
      status,
      payload: stripeEvent
    };
  }
  async retrievePayment(paymentReference) {
    const paymentIntent = await retryWithBackoff(
      () => this.stripe.paymentIntents.retrieve(paymentReference)
    );
    let status = "pending";
    if (paymentIntent.status === "succeeded") status = "paid";
    else if (paymentIntent.status === "canceled" || paymentIntent.status === "requires_payment_method") {
      status = "failed";
    }
    return {
      status,
      amount: paymentIntent.amount_received || paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase()
    };
  }
  async refundPayment(options) {
    const refundParams = {
      payment_intent: options.paymentReference,
      amount: options.amount,
      reason: options.reason
    };
    const refund = await retryWithBackoff(
      () => this.stripe.refunds.create(
        refundParams,
        options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : void 0
      ),
      { maxAttempts: 3 }
    );
    return {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status === "succeeded" ? "succeeded" : refund.status === "pending" ? "pending" : "failed",
      currency: refund.currency.toUpperCase()
    };
  }
  async cancelPayment(paymentReference) {
    try {
      const intent = await this.stripe.paymentIntents.cancel(paymentReference);
      return intent.status === "canceled";
    } catch {
      return false;
    }
  }
};

// src/modules/payments/providers/cod/cod.provider.ts
init_config();
var CodPaymentProvider = class {
  providerName = "cod";
  async createCheckout(options) {
    const sessionId = `cod_${options.orderNumber}_${Date.now()}`;
    const checkoutUrl = `${config.server.frontendUrl}/checkout/success?session_id=${sessionId}&order=${options.orderNumber}&provider=cod`;
    return {
      sessionId,
      checkoutUrl,
      provider: this.providerName
    };
  }
  async verifyWebhook(_eventPayload) {
    throw new Error("Webhooks are not applicable for Cash on Delivery");
  }
  async retrievePayment(_paymentReference) {
    return {
      status: "pending",
      amount: 0,
      currency: config.store.currency
    };
  }
  async refundPayment(options) {
    return {
      refundId: `cod_refund_${Date.now()}`,
      amount: options.amount || 0,
      status: "succeeded",
      currency: config.store.currency
    };
  }
};

// src/modules/payments/providers/index.ts
var stripeProviderInstance = null;
var codProviderInstance = null;
function getPaymentProvider(providerName) {
  const selected = providerName || config.payment.provider;
  switch (selected.toLowerCase()) {
    case "cod":
      if (!codProviderInstance) {
        codProviderInstance = new CodPaymentProvider();
      }
      return codProviderInstance;
    case "stripe":
    default:
      if (!stripeProviderInstance) {
        stripeProviderInstance = new StripePaymentProvider();
      }
      return stripeProviderInstance;
  }
}

// src/modules/checkout/checkout.service.ts
init_config();
async function sendCheckoutOtp(input) {
  const normalizedEmail = input.email.toLowerCase().trim();
  const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  await CheckoutOtp.deleteMany({ email: normalizedEmail });
  await CheckoutOtp.create({
    email: normalizedEmail,
    otp,
    expiresAt,
    isVerified: false
  });
  logger.info(`[CHECKOUT OTP] Verification code generated for ${normalizedEmail}: ${otp}`);
  try {
    await sendCheckoutOtpEmail(normalizedEmail, input.fullName || "Customer", otp);
    logger.info(`[CHECKOUT OTP] Verification email dispatched to ${normalizedEmail}`);
  } catch (err) {
    logger.warn(`[CHECKOUT OTP] SMTP dispatch skipped or failed (${err.message}). Code logged to console: ${otp}`);
  }
  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}. Valid for 10 minutes.`,
    testOtp: config.isDevelopment ? otp : void 0
  };
}
async function verifyCheckoutOtp(input) {
  const normalizedEmail = input.email.toLowerCase().trim();
  const record = await CheckoutOtp.findOne({
    email: normalizedEmail,
    expiresAt: { $gt: /* @__PURE__ */ new Date() }
  }).sort({ createdAt: -1 });
  if (!record) {
    throw new ValidationError("Verification code has expired or was not requested. Please request a new code.");
  }
  if (record.otp !== input.code.trim()) {
    throw new ValidationError("Invalid 6-digit verification code. Please check and try again.");
  }
  const verificationToken = "vtok_" + import_crypto2.default.randomBytes(24).toString("hex");
  record.isVerified = true;
  record.verificationToken = verificationToken;
  await record.save();
  logger.info(`[CHECKOUT OTP] Email ${normalizedEmail} successfully verified with token ${verificationToken}`);
  return {
    verified: true,
    verificationToken,
    email: normalizedEmail,
    message: "Email address verified successfully."
  };
}
async function calculateCheckout(input, userId) {
  const calculatedItems = [];
  let subtotal = 0;
  for (const itemInput of input.items) {
    let product;
    if (import_mongoose22.default.isValidObjectId(itemInput.productId)) {
      product = await Product.findById(itemInput.productId);
    }
    if (!product) {
      const cleanSlug = itemInput.productId.replace(/^seed-/, "");
      product = await Product.findOne({
        $or: [{ slug: cleanSlug }, { sku: itemInput.productId }]
      });
    }
    if (!product || !product.isActive) {
      throw new NotFoundError(`Product '${itemInput.productId}' not found or unavailable`);
    }
    let unitPrice = product.basePrice;
    let variantName;
    let variantColorHex;
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
      if (product.inventoryPolicy === "track") {
        const available = variant.inventory - variant.reservedInventory;
        if (available < itemInput.quantity) {
          throw new InsufficientInventoryError(`${product.name} (${variant.name})`);
        }
      }
    } else {
      if (product.inventoryPolicy === "track") {
        const available = product.inventory - product.reservedInventory;
        if (available < itemInput.quantity) {
          throw new InsufficientInventoryError(product.name);
        }
      }
    }
    const totalPrice = unitPrice * itemInput.quantity;
    subtotal = addSubunit(subtotal, totalPrice);
    calculatedItems.push({
      product: product._id,
      variantId: itemInput.variantId ? new import_mongoose22.default.Types.ObjectId(itemInput.variantId) : void 0,
      productName: product.name,
      sku,
      variantName,
      variantColorHex,
      image,
      quantity: itemInput.quantity,
      unitPrice,
      totalPrice
    });
  }
  let discountAmount = 0;
  let appliedCouponCode;
  if (input.couponCode) {
    const coupon = await Coupon.findOne({
      code: input.couponCode.toUpperCase(),
      isActive: true,
      startsAt: { $lte: /* @__PURE__ */ new Date() },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: /* @__PURE__ */ new Date() } }]
    });
    if (!coupon) {
      throw new ValidationError("Invalid or expired coupon code");
    }
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError("Coupon usage limit reached");
    }
    if (userId && coupon.userUsageLimit > 0) {
      const userUsage = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: userId
      });
      if (userUsage >= coupon.userUsageLimit) {
        throw new ValidationError("You have already used this coupon maximum times");
      }
    }
    if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
      throw new ValidationError(
        `Order subtotal does not meet minimum order value for this coupon`
      );
    }
    if (coupon.discountType === "percentage") {
      discountAmount = Math.floor(subtotal * coupon.discountValue / 100);
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
    appliedCouponCode = coupon.code;
  }
  let shippingFee = 0;
  if (input.shippingAddress) {
    const zone = await ShippingZone.findOne({
      countries: input.shippingAddress.country.toUpperCase(),
      isActive: true
    });
    if (zone && zone.methods.length > 0) {
      const activeMethod = zone.methods.find((m) => m.isActive) || zone.methods[0];
      if (zone.freeShippingThreshold && zone.freeShippingThreshold > 0 && subtotal >= zone.freeShippingThreshold) {
        shippingFee = 0;
      } else {
        shippingFee = activeMethod ? activeMethod.price : 0;
      }
    }
  }
  const taxAmount = 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);
  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    couponCode: appliedCouponCode,
    shippingFee,
    taxAmount,
    grandTotal,
    currency: config.store.currency
  };
}
async function createOrder(input, userId) {
  if (!userId && (!input.guestEmail || !input.guestName)) {
    throw new ValidationError("Guest checkout requires both full name and email address");
  }
  if (!userId && input.guestEmail) {
    const verifiedOtp = await CheckoutOtp.findOne({
      email: input.guestEmail.toLowerCase().trim(),
      verificationToken: input.emailVerificationToken,
      isVerified: true
    });
    if (!verifiedOtp && !config.isTest) {
      throw new ValidationError(
        "Please verify your email address before finalizing vehicle delivery checkout."
      );
    }
  }
  const calculated = await calculateCheckout(input, userId);
  const orderNumber = generateOrderNumber();
  const reserveItems = calculated.items.map((i) => ({
    productId: i.product.toString(),
    variantId: i.variantId ? i.variantId.toString() : void 0,
    quantity: i.quantity,
    sku: i.sku
  }));
  await reserveInventoryBatch(reserveItems, orderNumber);
  const isCod = input.paymentProvider === "cod";
  const handoverNotes = input.deliveryHandover?.handoverNotes;
  const timeSlot = input.deliveryHandover?.preferredTimeSlot;
  const prefDate = input.deliveryHandover?.preferredDate;
  const combinedNotes = [
    input.customerNotes,
    prefDate ? `Preferred Handover Date: ${prefDate}` : null,
    timeSlot ? `Preferred Window: ${timeSlot.toUpperCase()}` : null,
    input.nationalIdOrCnic ? `Recipient CNIC/ID: ${input.nationalIdOrCnic}` : null,
    handoverNotes ? `Handover Instructions: ${handoverNotes}` : null
  ].filter(Boolean).join(" | ");
  const order = await Order.create({
    orderNumber,
    user: userId ? new import_mongoose22.default.Types.ObjectId(userId) : void 0,
    guestEmail: userId ? void 0 : input.guestEmail,
    guestName: userId ? void 0 : input.guestName,
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
    paymentStatus: "pending",
    orderStatus: isCod ? "confirmed" : "pending_payment",
    customerNotes: combinedNotes,
    metadata: {
      vehicleHandover: {
        preferredDate: input.deliveryHandover?.preferredDate,
        preferredTimeSlot: input.deliveryHandover?.preferredTimeSlot,
        handoverType: input.deliveryHandover?.handoverType || "home_delivery",
        landmarkOrCrossStreet: input.deliveryHandover?.landmarkOrCrossStreet,
        handoverNotes: input.deliveryHandover?.handoverNotes,
        nationalIdOrCnic: input.nationalIdOrCnic,
        guestPhone: input.guestPhone || input.shippingAddress.phone
      },
      verifiedEmail: userId ? true : !!input.emailVerificationToken
    },
    statusHistory: [
      {
        status: isCod ? "confirmed" : "pending_payment",
        timestamp: /* @__PURE__ */ new Date(),
        note: `Order placed via ${input.paymentProvider.toUpperCase()} with complete vehicle delivery information`
      }
    ]
  });
  if (calculated.couponCode) {
    const coupon = await Coupon.findOne({ code: calculated.couponCode });
    if (coupon) {
      await CouponUsage.create({
        coupon: coupon._id,
        couponCode: coupon.code,
        user: userId ? new import_mongoose22.default.Types.ObjectId(userId) : void 0,
        order: order._id,
        orderNumber: order.orderNumber,
        discountAmount: calculated.discountAmount
      });
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
    }
  }
  const provider = getPaymentProvider(input.paymentProvider);
  const customerName = userId ? "Valued Customer" : input.guestName || "Customer";
  const customerEmail = input.guestEmail || "customer@evee.pk";
  const checkoutResult = await provider.createCheckout({
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: input.shippingAddress.phone
    },
    items: calculated.items.map((i) => ({
      name: i.productName + (i.variantName ? ` - ${i.variantName}` : ""),
      unitAmount: i.unitPrice,
      quantity: i.quantity,
      images: i.image ? [i.image] : void 0
    })),
    subtotal: calculated.subtotal,
    discountAmount: calculated.discountAmount,
    shippingFee: calculated.shippingFee,
    taxAmount: calculated.taxAmount,
    grandTotal: calculated.grandTotal,
    currency: calculated.currency,
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber
    }
  });
  order.paymentReference = checkoutResult.sessionId;
  await order.save();
  await Payment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    provider: input.paymentProvider,
    providerSessionId: checkoutResult.sessionId,
    amount: calculated.grandTotal,
    currency: calculated.currency,
    status: "pending"
  });
  return {
    order,
    checkoutUrl: checkoutResult.checkoutUrl,
    sessionId: checkoutResult.sessionId
  };
}

// src/modules/checkout/checkout.controller.ts
async function sendOtp(req, res, next) {
  try {
    const result = await sendCheckoutOtp(req.body);
    successResponse(res, result, { message: result.message });
  } catch (err) {
    next(err);
  }
}
async function verifyOtp(req, res, next) {
  try {
    const result = await verifyCheckoutOtp(req.body);
    successResponse(res, result, { message: result.message });
  } catch (err) {
    next(err);
  }
}
async function validateCheckout(req, res, next) {
  try {
    const userId = req.user?.userId;
    const summary = await calculateCheckout(req.body, userId);
    successResponse(res, { checkout: summary });
  } catch (err) {
    next(err);
  }
}
async function createOrder2(req, res, next) {
  try {
    const userId = req.user?.userId;
    const result = await createOrder(req.body, userId);
    successResponse(
      res,
      {
        order: result.order,
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId
      },
      { statusCode: 201, message: "Order created successfully" }
    );
  } catch (err) {
    next(err);
  }
}

// src/modules/checkout/checkout.validators.ts
var import_zod7 = require("zod");
var checkoutAddressSchema = addressSchema2.omit({ isDefault: true, label: true });
var checkoutItemSchema = import_zod7.z.object({
  productId: import_zod7.z.string().min(1, "Product identifier is required"),
  variantId: import_zod7.z.string().optional(),
  quantity: import_zod7.z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").max(999, "Quantity cannot exceed 999")
});
var deliveryHandoverSchema = import_zod7.z.object({
  preferredDate: import_zod7.z.string().optional(),
  preferredTimeSlot: import_zod7.z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime").optional(),
  handoverType: import_zod7.z.enum(["home_delivery", "atelier_pickup"]).default("home_delivery").optional(),
  landmarkOrCrossStreet: import_zod7.z.string().trim().max(200).optional(),
  handoverNotes: import_zod7.z.string().trim().max(500).optional()
});
var sendCheckoutOtpSchema = import_zod7.z.object({
  email: import_zod7.z.string().trim().email("Please enter a valid email address").toLowerCase(),
  fullName: import_zod7.z.string().trim().max(100).optional()
});
var verifyCheckoutOtpSchema = import_zod7.z.object({
  email: import_zod7.z.string().trim().email("Please enter a valid email address").toLowerCase(),
  code: import_zod7.z.string().trim().regex(/^\d{6}$/, "Verification code must be exactly 6 numeric digits")
});
var validateCheckoutSchema = import_zod7.z.object({
  items: import_zod7.z.array(checkoutItemSchema).min(1, "At least one item is required to validate checkout"),
  couponCode: import_zod7.z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Coupon code must be 3-30 uppercase characters, numbers, or hyphens").optional(),
  shippingAddress: checkoutAddressSchema.optional(),
  paymentProvider: import_zod7.z.enum(["stripe", "cod", "bank_transfer"]).default("stripe")
});
var createOrderSchema = import_zod7.z.object({
  items: import_zod7.z.array(checkoutItemSchema).min(1, "At least one item is required to create an order"),
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  couponCode: import_zod7.z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Coupon code must be 3-30 uppercase characters, numbers, or hyphens").optional(),
  paymentProvider: import_zod7.z.enum(["stripe", "cod", "bank_transfer"]).default("stripe"),
  customerNotes: import_zod7.z.string().trim().max(500, "Customer notes cannot exceed 500 characters").optional(),
  guestName: import_zod7.z.string().trim().min(2, "Guest name must be at least 2 characters").max(100).optional(),
  guestEmail: import_zod7.z.string().trim().email("Please enter a valid guest email address").toLowerCase().optional(),
  guestPhone: import_zod7.z.string().trim().optional(),
  nationalIdOrCnic: import_zod7.z.string().trim().max(50).optional(),
  deliveryHandover: deliveryHandoverSchema.optional(),
  emailVerificationToken: import_zod7.z.string().trim().optional()
});

// src/modules/checkout/checkout.routes.ts
var checkoutRouter = (0, import_express7.Router)();
checkoutRouter.post(
  "/send-otp",
  checkoutLimiter,
  validate(sendCheckoutOtpSchema),
  sendOtp
);
checkoutRouter.post(
  "/verify-otp",
  checkoutLimiter,
  validate(verifyCheckoutOtpSchema),
  verifyOtp
);
checkoutRouter.post(
  "/validate",
  optionalAuth,
  validate(validateCheckoutSchema),
  validateCheckout
);
checkoutRouter.post(
  "/create-order",
  checkoutLimiter,
  optionalAuth,
  validate(createOrderSchema),
  createOrder2
);

// src/modules/orders/order.routes.ts
var import_express8 = require("express");

// src/modules/orders/order.service.ts
var import_mongoose23 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function trackOrder(orderNumber, email) {
  if (import_mongoose23.default.connection.readyState !== 1) {
    throw new NotFoundError("Order");
  }
  const query = { orderNumber };
  if (email) {
    query.$or = [{ guestEmail: email.toLowerCase() }, { "shippingAddress.email": email.toLowerCase() }];
  }
  const order = await Order.findOne(query);
  if (!order) throw new NotFoundError("Order");
  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    shippingCarrier: order.shippingCarrier,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    itemsSummary: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
    createdAt: order.createdAt
  };
}
async function getOrder(orderNumber, userId, isAdmin = false) {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError("Order");
  if (!isAdmin && order.user && order.user.toString() !== userId) {
    throw new UnauthorizedError("You are not authorized to view this order");
  }
  return order;
}
async function cancelOrder(orderNumber, userId, reason) {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError("Order");
  if (order.user && order.user.toString() !== userId) {
    throw new UnauthorizedError("You are not authorized to cancel this order");
  }
  if (order.orderStatus !== "pending_payment" && order.orderStatus !== "confirmed") {
    throw new AppError(
      `Order cannot be cancelled in its current status (${order.orderStatus}). Please contact support.`,
      400
    );
  }
  order.orderStatus = "cancelled";
  order.cancelledAt = /* @__PURE__ */ new Date();
  order.cancellationReason = reason || "Cancelled by customer";
  order.statusHistory.push({
    status: "cancelled",
    timestamp: /* @__PURE__ */ new Date(),
    note: reason || "Cancelled by customer"
  });
  await order.save();
  await releaseOrderReservations(order.items).catch(
    (err) => logger.error("Failed to release reservations on order cancellation:", err)
  );
  const recipientEmail = order.guestEmail || "customer@evee.pk";
  const recipientName = order.guestName || order.shippingAddress.fullName;
  sendCancellationEmail(recipientEmail, recipientName, order.orderNumber, reason).catch(
    (err) => logger.error("Failed to send cancellation email:", err)
  );
  return order;
}

// src/modules/orders/order.controller.ts
async function trackOrder2(req, res, next) {
  try {
    const email = req.query.email;
    const tracking = await trackOrder(req.params.orderNumber, email);
    successResponse(res, { tracking });
  } catch (err) {
    next(err);
  }
}
async function getOrder2(req, res, next) {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === "admin";
    const order = await getOrder(req.params.orderNumber, userId, isAdmin);
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}
async function cancelOrder2(req, res, next) {
  try {
    const userId = req.user?.userId;
    const order = await cancelOrder(
      req.params.orderNumber,
      userId,
      req.body.reason
    );
    successResponse(res, { order }, { message: "Order successfully cancelled" });
  } catch (err) {
    next(err);
  }
}

// src/modules/orders/order.validators.ts
var import_zod8 = require("zod");
var trackOrderSchema = import_zod8.z.object({
  email: import_zod8.z.string().trim().email().toLowerCase().optional()
});
var cancelOrderSchema = import_zod8.z.object({
  reason: import_zod8.z.string().trim().min(3).max(300).optional()
});

// src/modules/orders/order.routes.ts
var orderRouter = (0, import_express8.Router)();
orderRouter.get("/track/:orderNumber", trackOrder2);
orderRouter.get("/:orderNumber", optionalAuth, getOrder2);
orderRouter.post(
  "/:orderNumber/cancel",
  authenticate,
  validate(cancelOrderSchema),
  cancelOrder2
);

// src/modules/payments/payment.routes.ts
var import_express9 = require("express");

// src/modules/payments/payment.service.ts
var import_mongoose24 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function processStripeWebhook(rawBody, signature) {
  const provider = getPaymentProvider("stripe");
  const verifiedEvent = await provider.verifyWebhook({
    rawBody,
    signature
  });
  const existingEvent = await WebhookEvent.findOne({
    provider: "stripe",
    eventId: verifiedEvent.eventId
  });
  if (existingEvent && existingEvent.status === "processed") {
    logger.info(`Webhook event ${verifiedEvent.eventId} already processed, skipping duplicate`);
    return { received: true, eventId: verifiedEvent.eventId };
  }
  const webhookRecord = existingEvent || await WebhookEvent.create({
    provider: "stripe",
    eventId: verifiedEvent.eventId,
    eventType: verifiedEvent.eventType,
    payload: verifiedEvent.payload,
    status: "received"
  });
  try {
    if (verifiedEvent.status === "paid" && verifiedEvent.orderNumber) {
      await handlePaymentSuccess(verifiedEvent);
    } else if (verifiedEvent.status === "failed" && verifiedEvent.orderNumber) {
      await handlePaymentFailure(verifiedEvent);
    } else if (verifiedEvent.status === "refunded" && verifiedEvent.orderNumber) {
      await handlePaymentRefunded(verifiedEvent);
    }
    webhookRecord.status = "processed";
    webhookRecord.processedAt = /* @__PURE__ */ new Date();
    await webhookRecord.save();
    return { received: true, eventId: verifiedEvent.eventId };
  } catch (error) {
    webhookRecord.status = "failed";
    webhookRecord.processingError = error.message;
    await webhookRecord.save();
    logger.error(`Error processing webhook event ${verifiedEvent.eventId}:`, error);
    throw error;
  }
}
async function handlePaymentSuccess(event) {
  const order = await Order.findOne({ orderNumber: event.orderNumber });
  if (!order) {
    logger.warn(`Webhook received for unknown order: ${event.orderNumber}`);
    return;
  }
  if (order.paymentStatus === "paid") {
    logger.info(`Order ${order.orderNumber} already marked paid, skipping redundant commit`);
    return;
  }
  if (event.amount && event.amount !== order.grandTotal) {
    logger.error(
      `Payment amount mismatch for order ${order.orderNumber}: expected ${order.grandTotal}, received ${event.amount}`
    );
    throw new PaymentError("Payment amount mismatch");
  }
  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.stripePaymentIntentId = event.paymentIntentId || order.stripePaymentIntentId;
  order.statusHistory.push({
    status: "confirmed",
    timestamp: /* @__PURE__ */ new Date(),
    note: `Payment verified via ${event.provider} (${event.eventType})`
  });
  await order.save();
  await Payment.updateOne(
    { orderNumber: order.orderNumber },
    {
      $set: {
        status: "paid",
        paidAt: /* @__PURE__ */ new Date(),
        providerPaymentIntentId: event.paymentIntentId,
        providerChargeId: event.chargeId
      },
      $addToSet: { processedEventIds: event.eventId }
    }
  );
  await commitOrderInventory(order.items, order.orderNumber);
  const recipientEmail = order.guestEmail || "customer@evee.pk";
  const recipientName = order.guestName || order.shippingAddress.fullName;
  const itemsList = order.items.map((i) => ({
    name: i.productName + (i.variantName ? ` (${i.variantName})` : ""),
    quantity: i.quantity,
    price: `${order.currency} ${fromSubunit(i.totalPrice)}`
  }));
  sendOrderConfirmationEmail(
    recipientEmail,
    recipientName,
    order.orderNumber,
    itemsList,
    `${order.currency} ${fromSubunit(order.grandTotal)}`
  ).catch((err) => logger.error("Order confirmation email failed:", err));
}
async function handlePaymentFailure(event) {
  const order = await Order.findOne({ orderNumber: event.orderNumber });
  if (!order) return;
  order.paymentStatus = "failed";
  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: /* @__PURE__ */ new Date(),
    note: `Payment failed via ${event.provider}`
  });
  await order.save();
  await Payment.updateOne(
    { orderNumber: order.orderNumber },
    {
      $set: { status: "failed", failedAt: /* @__PURE__ */ new Date() },
      $addToSet: { processedEventIds: event.eventId }
    }
  );
  await releaseOrderReservations(order.items);
}
async function handlePaymentRefunded(event) {
  const order = await Order.findOne({ orderNumber: event.orderNumber });
  if (!order) return;
  const refundAmount = event.amount || order.grandTotal;
  order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
  order.paymentStatus = order.refundedAmount >= order.grandTotal ? "refunded" : "partially_refunded";
  order.orderStatus = order.refundedAmount >= order.grandTotal ? "refunded" : "partially_refunded";
  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: /* @__PURE__ */ new Date(),
    note: `Refund confirmed via ${event.provider} event ${event.eventId}`
  });
  await order.save();
}
async function getPaymentStatus(orderNumber) {
  let order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError("Order");
  if (order.paymentStatus === "pending" && order.paymentReference?.startsWith("cs_test_")) {
    logger.info(`[STRIPE TEST MODE] Auto-confirming test payment for order ${orderNumber}`);
    try {
      await handlePaymentSuccess({
        eventId: `evt_sim_${Date.now()}`,
        eventType: "checkout.session.completed",
        provider: "stripe",
        orderNumber: order.orderNumber,
        paymentIntentId: `pi_sim_${Date.now()}`,
        amount: order.grandTotal,
        currency: order.currency,
        status: "paid",
        payload: { simulated: true }
      });
      order = await Order.findOne({ orderNumber });
    } catch (err) {
      logger.error("Error auto-confirming simulated payment:", err);
    }
  }
  const payment = await Payment.findOne({ orderNumber });
  return {
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    grandTotal: order.grandTotal,
    currency: order.currency,
    paidAt: payment?.paidAt,
    order
  };
}
async function processRefund(params) {
  const order = await Order.findOne({ orderNumber: params.orderNumber });
  if (!order) throw new NotFoundError("Order");
  const payment = await Payment.findOne({ orderNumber: params.orderNumber });
  if (!payment) throw new NotFoundError("Payment record");
  if (order.paymentStatus !== "paid" && order.paymentStatus !== "partially_refunded") {
    throw new AppError("Cannot refund an unpaid order", 400);
  }
  const remainingRefundable = order.grandTotal - (order.refundedAmount || 0);
  const requestedRefund = params.amount ?? remainingRefundable;
  if (requestedRefund <= 0 || requestedRefund > remainingRefundable) {
    throw new AppError(
      `Invalid refund amount. Maximum refundable is ${fromSubunit(remainingRefundable)}`,
      400
    );
  }
  const provider = getPaymentProvider(payment.provider);
  const paymentReference = payment.providerPaymentIntentId || payment.providerChargeId || "";
  const refundResult = await provider.refundPayment({
    paymentReference,
    amount: requestedRefund,
    reason: params.reason,
    idempotencyKey: `refund_${order.orderNumber}_${Date.now()}`
  });
  payment.refunds.push({
    refundId: refundResult.refundId,
    amount: refundResult.amount,
    reason: params.reason,
    status: refundResult.status,
    requestedAt: /* @__PURE__ */ new Date(),
    processedAt: /* @__PURE__ */ new Date(),
    requestedBy: new import_mongoose24.default.Types.ObjectId(params.adminUserId)
  });
  payment.refundedTotal = (payment.refundedTotal || 0) + refundResult.amount;
  payment.status = payment.refundedTotal >= payment.amount ? "refunded" : "partially_refunded";
  await payment.save();
  order.refundedAmount = (order.refundedAmount || 0) + refundResult.amount;
  order.paymentStatus = order.refundedAmount >= order.grandTotal ? "refunded" : "partially_refunded";
  order.orderStatus = order.refundedAmount >= order.grandTotal ? "refunded" : "partially_refunded";
  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: /* @__PURE__ */ new Date(),
    note: `Refund of ${order.currency} ${fromSubunit(refundResult.amount)} processed (${params.reason || "Admin initiated"})`,
    updatedBy: new import_mongoose24.default.Types.ObjectId(params.adminUserId)
  });
  await order.save();
  await AuditLog.create({
    action: "ORDER_REFUND",
    entity: "Order",
    entityId: order._id.toString(),
    performedBy: new import_mongoose24.default.Types.ObjectId(params.adminUserId),
    performedByRole: "admin",
    ipAddress: params.ipAddress,
    metadata: {
      orderNumber: order.orderNumber,
      refundAmount: refundResult.amount,
      refundId: refundResult.refundId,
      reason: params.reason
    }
  });
  const recipientEmail = order.guestEmail || "customer@evee.pk";
  const recipientName = order.guestName || order.shippingAddress.fullName;
  sendRefundEmail(
    recipientEmail,
    recipientName,
    order.orderNumber,
    `${order.currency} ${fromSubunit(refundResult.amount)}`
  ).catch((err) => logger.error("Refund email failed:", err));
  return { order, payment };
}

// src/modules/payments/payment.controller.ts
async function stripeWebhook(req, res, next) {
  try {
    const signature = req.headers["stripe-signature"];
    const rawBody = req.body;
    const result = await processStripeWebhook(rawBody, signature);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
async function getPaymentStatus2(req, res, next) {
  try {
    const status = await getPaymentStatus(req.params.orderNumber);
    successResponse(res, { paymentStatus: status });
  } catch (err) {
    next(err);
  }
}
async function refundPayment(req, res, next) {
  try {
    const result = await processRefund({
      orderNumber: req.params.orderNumber,
      amount: req.body.amount,
      reason: req.body.reason,
      adminUserId: req.user.userId,
      ipAddress: req.ip
    });
    successResponse(res, result, { message: "Refund successfully processed" });
  } catch (err) {
    next(err);
  }
}

// src/modules/payments/payment.routes.ts
var paymentRouter = (0, import_express9.Router)();
paymentRouter.post("/stripe/webhook", stripeWebhook);
paymentRouter.get("/:orderNumber/status", getPaymentStatus2);
paymentRouter.post(
  "/:orderNumber/refund",
  authenticate,
  authorize("admin"),
  refundPayment
);

// src/modules/coupons/coupon.routes.ts
var import_express10 = require("express");

// src/modules/coupons/coupon.service.ts
var import_mongoose25 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function validateCoupon(code, subtotal, userId) {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startsAt: { $lte: /* @__PURE__ */ new Date() },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: /* @__PURE__ */ new Date() } }]
  });
  if (!coupon) {
    throw new ValidationError("Invalid or expired coupon code");
  }
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    throw new ValidationError("Coupon usage limit reached");
  }
  if (userId && coupon.userUsageLimit > 0) {
    const usageCount = await CouponUsage.countDocuments({
      coupon: coupon._id,
      user: userId
    });
    if (usageCount >= coupon.userUsageLimit) {
      throw new ValidationError("You have already reached the usage limit for this coupon");
    }
  }
  if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
    throw new ValidationError(
      `Coupon requires a minimum order value of ${coupon.minimumOrderValue}`
    );
  }
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.floor(subtotal * coupon.discountValue / 100);
    if (coupon.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    minimumOrderValue: coupon.minimumOrderValue
  };
}
async function getCoupons(isAdmin = false) {
  const filter = isAdmin ? {} : { isActive: true };
  return Coupon.find(filter).sort({ createdAt: -1 });
}
async function createCoupon(data, adminUserId) {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new ConflictError("A coupon with this code already exists");
  }
  return Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
    applicableProducts: data.applicableProducts?.map((id) => new import_mongoose25.default.Types.ObjectId(id)) || [],
    applicableCategories: data.applicableCategories?.map((id) => new import_mongoose25.default.Types.ObjectId(id)) || [],
    createdBy: new import_mongoose25.default.Types.ObjectId(adminUserId)
  });
}
async function updateCoupon(id, data) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new NotFoundError("Coupon");
  if (data.code && data.code.toUpperCase() !== coupon.code) {
    const exists = await Coupon.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
    if (exists) throw new ConflictError("A coupon with this code already exists");
    coupon.code = data.code.toUpperCase();
  }
  const { code: _c, applicableProducts, applicableCategories, ...other } = data;
  if (applicableProducts) {
    coupon.applicableProducts = applicableProducts.map((p) => new import_mongoose25.default.Types.ObjectId(p));
  }
  if (applicableCategories) {
    coupon.applicableCategories = applicableCategories.map((c) => new import_mongoose25.default.Types.ObjectId(c));
  }
  Object.assign(coupon, other);
  return coupon.save();
}
async function deleteCoupon(id) {
  const result = await Coupon.findByIdAndDelete(id);
  if (!result) throw new NotFoundError("Coupon");
}

// src/modules/coupons/coupon.validators.ts
var import_zod9 = require("zod");
var createCouponSchema = import_zod9.z.object({
  code: import_zod9.z.string().trim().toUpperCase().min(3, "Coupon code must be at least 3 characters").max(30, "Coupon code cannot exceed 30 characters").regex(
    /^[A-Z0-9_-]{3,30}$/,
    "Coupon code must be uppercase letters, numbers, or dashes (e.g. EVEEFIRST)"
  ),
  description: import_zod9.z.string().trim().max(200, "Description cannot exceed 200 characters").optional(),
  discountType: import_zod9.z.enum(["percentage", "fixed"]),
  discountValue: import_zod9.z.number().int("Discount value must be an integer").min(1, "Discount value must be at least 1"),
  minimumOrderValue: import_zod9.z.number().int("Minimum order value must be an integer (in paisa)").min(0, "Minimum order value cannot be negative").default(0),
  maximumDiscountAmount: import_zod9.z.number().int().min(0).optional(),
  usageLimit: import_zod9.z.number().int().min(0, "Usage limit cannot be negative").default(0),
  userUsageLimit: import_zod9.z.number().int().min(0, "User usage limit cannot be negative").default(1),
  applicableProducts: import_zod9.z.array(import_zod9.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ObjectId")).default([]),
  applicableCategories: import_zod9.z.array(import_zod9.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ObjectId")).default([]),
  startsAt: import_zod9.z.string().datetime().or(import_zod9.z.date()),
  expiresAt: import_zod9.z.string().datetime().or(import_zod9.z.date()).optional(),
  isActive: import_zod9.z.boolean().default(true)
});
var updateCouponSchema = createCouponSchema.partial();
var validateCouponQuerySchema = import_zod9.z.object({
  code: import_zod9.z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Invalid coupon code format (must be 3-30 letters/numbers)"),
  subtotal: import_zod9.z.string().optional().transform((v) => v ? parseInt(v, 10) : 0)
});

// src/modules/coupons/coupon.controller.ts
async function validateCoupon2(req, res, next) {
  try {
    const { code, subtotal } = validateCouponQuerySchema.parse(req.query);
    const userId = req.user?.userId;
    const result = await validateCoupon(code, subtotal || 0, userId);
    successResponse(res, { coupon: result });
  } catch (err) {
    next(err);
  }
}
async function getCoupons2(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const coupons = await getCoupons(isAdmin);
    successResponse(res, { coupons });
  } catch (err) {
    next(err);
  }
}
async function createCoupon2(req, res, next) {
  try {
    const coupon = await createCoupon(req.body, req.user.userId);
    successResponse(res, { coupon }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}
async function updateCoupon2(req, res, next) {
  try {
    const coupon = await updateCoupon(req.params.id, req.body);
    successResponse(res, { coupon });
  } catch (err) {
    next(err);
  }
}
async function deleteCoupon2(req, res, next) {
  try {
    await deleteCoupon(req.params.id);
    successResponse(res, null, { message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
}

// src/modules/coupons/coupon.routes.ts
var couponRouter = (0, import_express10.Router)();
couponRouter.get("/validate", optionalAuth, validateCoupon2);
couponRouter.get("/", authenticate, authorize("admin"), getCoupons2);
couponRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCouponSchema),
  createCoupon2
);
couponRouter.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateCouponSchema),
  updateCoupon2
);
couponRouter.delete("/:id", authenticate, authorize("admin"), deleteCoupon2);

// src/modules/reviews/review.routes.ts
var import_express11 = require("express");

// src/modules/reviews/review.service.ts
var import_mongoose26 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function getProductReviews(productId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ product: productId, status: "approved" }).populate("user", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments({ product: productId, status: "approved" })
  ]);
  return { reviews, meta: paginationMeta(page, limit, total) };
}
async function createReview(data, userId) {
  const product = await Product.findById(data.productId);
  if (!product) throw new NotFoundError("Product");
  const existing = await Review.findOne({ product: data.productId, user: userId });
  if (existing) {
    throw new ConflictError("You have already reviewed this product");
  }
  const verifiedOrder = await Order.findOne({
    user: userId,
    "items.product": data.productId,
    orderStatus: "delivered"
  });
  const review = await Review.create({
    product: new import_mongoose26.default.Types.ObjectId(data.productId),
    user: new import_mongoose26.default.Types.ObjectId(userId),
    order: verifiedOrder ? verifiedOrder._id : void 0,
    rating: data.rating,
    title: data.title,
    body: data.body,
    isVerifiedPurchase: !!verifiedOrder,
    status: "approved",
    // Auto-approve or queue for moderation
    reviewedAt: /* @__PURE__ */ new Date()
  });
  await recalculateProductRating(data.productId);
  return review;
}
async function moderateReview(reviewId, data) {
  const review = await Review.findById(reviewId);
  if (!review) throw new NotFoundError("Review");
  review.status = data.status;
  review.adminNote = data.adminNote;
  await review.save();
  await recalculateProductRating(review.product.toString());
  return review;
}
async function deleteReview(reviewId) {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) throw new NotFoundError("Review");
  await recalculateProductRating(review.product.toString());
}
async function recalculateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: new import_mongoose26.default.Types.ObjectId(productId), status: "approved" } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  if (stats.length > 0) {
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          reviewCount: stats[0].reviewCount
        }
      }
    );
  } else {
    await Product.updateOne(
      { _id: productId },
      { $set: { averageRating: 0, reviewCount: 0 } }
    );
  }
}

// src/modules/reviews/review.controller.ts
async function getProductReviews2(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10)));
    const result = await getProductReviews(req.params.productId, page, limit);
    successResponse(res, { reviews: result.reviews }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}
async function createReview2(req, res, next) {
  try {
    const review = await createReview(req.body, req.user.userId);
    successResponse(res, { review }, { statusCode: 201, message: "Review submitted" });
  } catch (err) {
    next(err);
  }
}
async function moderateReview2(req, res, next) {
  try {
    const review = await moderateReview(req.params.id, req.body);
    successResponse(res, { review });
  } catch (err) {
    next(err);
  }
}
async function deleteReview2(req, res, next) {
  try {
    await deleteReview(req.params.id);
    successResponse(res, null, { message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}

// src/modules/reviews/review.validators.ts
var import_zod10 = require("zod");
var createReviewSchema = import_zod10.z.object({
  productId: import_zod10.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ObjectId format"),
  rating: import_zod10.z.number().int("Rating must be an integer").min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  title: import_zod10.z.string().trim().max(200, "Title cannot exceed 200 characters").optional(),
  body: import_zod10.z.string().trim().min(5, "Review must be at least 5 characters").max(5e3, "Review cannot exceed 5000 characters")
});
var moderateReviewSchema = import_zod10.z.object({
  status: import_zod10.z.enum(["pending", "approved", "rejected"]),
  adminNote: import_zod10.z.string().trim().max(500, "Admin note cannot exceed 500 characters").optional()
});

// src/modules/reviews/review.routes.ts
var reviewRouter = (0, import_express11.Router)();
reviewRouter.get("/product/:productId", getProductReviews2);
reviewRouter.post("/", authenticate, validate(createReviewSchema), createReview2);
reviewRouter.patch(
  "/:id/moderate",
  authenticate,
  authorize("admin"),
  validate(moderateReviewSchema),
  moderateReview2
);
reviewRouter.delete("/:id", authenticate, authorize("admin"), deleteReview2);

// src/modules/wishlist/wishlist.routes.ts
var import_express12 = require("express");

// src/modules/wishlist/wishlist.service.ts
var import_mongoose27 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function getWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate("products");
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: new import_mongoose27.default.Types.ObjectId(userId),
      products: []
    });
  }
  return wishlist;
}
async function addToWishlist(userId, productId) {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product");
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({
      user: new import_mongoose27.default.Types.ObjectId(userId),
      products: []
    });
  }
  const prodObjId = new import_mongoose27.default.Types.ObjectId(productId);
  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(prodObjId);
    await wishlist.save();
  }
  return wishlist.populate("products");
}
async function removeFromWishlist(userId, productId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: new import_mongoose27.default.Types.ObjectId(userId),
      products: []
    });
  }
  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();
  return wishlist.populate("products");
}

// src/modules/wishlist/wishlist.controller.ts
async function getWishlist2(req, res, next) {
  try {
    const wishlist = await getWishlist(req.user.userId);
    successResponse(res, { wishlist });
  } catch (err) {
    next(err);
  }
}
async function addToWishlist2(req, res, next) {
  try {
    const wishlist = await addToWishlist(
      req.user.userId,
      req.params.productId
    );
    successResponse(res, { wishlist }, { message: "Product added to wishlist" });
  } catch (err) {
    next(err);
  }
}
async function removeFromWishlist2(req, res, next) {
  try {
    const wishlist = await removeFromWishlist(
      req.user.userId,
      req.params.productId
    );
    successResponse(res, { wishlist }, { message: "Product removed from wishlist" });
  } catch (err) {
    next(err);
  }
}

// src/modules/wishlist/wishlist.routes.ts
var wishlistRouter = (0, import_express12.Router)();
wishlistRouter.use(authenticate);
wishlistRouter.get("/", getWishlist2);
wishlistRouter.post("/:productId", addToWishlist2);
wishlistRouter.delete("/:productId", removeFromWishlist2);

// src/modules/admin/admin.routes.ts
var import_express13 = require("express");

// src/modules/admin/admin.service.ts
var import_mongoose29 = __toESM(require("mongoose"));
init_models();
init_AppError();

// src/modules/audit/audit.service.ts
var import_mongoose28 = __toESM(require("mongoose"));
init_models();
async function logAction(options) {
  await AuditLog.create({
    action: options.action,
    entity: options.entity,
    entityId: options.entityId,
    performedBy: new import_mongoose28.default.Types.ObjectId(options.performedBy),
    performedByRole: options.performedByRole,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    changes: options.changes,
    metadata: options.metadata
  });
}
async function getAuditLogs(page = 1, limit = 20, filter = {}) {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate("performedBy", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter)
  ]);
  return { logs, meta: paginationMeta(page, limit, total) };
}

// src/modules/admin/admin.service.ts
var VALID_STATUS_TRANSITIONS = {
  pending_payment: ["confirmed", "processing", "ready_to_ship", "cancelled"],
  confirmed: ["processing", "ready_to_ship", "shipped", "delivered", "cancelled"],
  processing: ["ready_to_ship", "shipped", "delivered", "cancelled"],
  ready_to_ship: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["partially_refunded", "refunded"],
  cancelled: ["pending_payment", "confirmed"],
  partially_refunded: ["refunded"],
  refunded: []
};
async function getOrders(page = 1, limit = 20, filterQuery = {}) {
  const filter = {};
  if (filterQuery.status) {
    filter.orderStatus = filterQuery.status;
  }
  if (filterQuery.search) {
    filter.$or = [
      { orderNumber: { $regex: filterQuery.search, $options: "i" } },
      { guestEmail: { $regex: filterQuery.search, $options: "i" } },
      { "shippingAddress.fullName": { $regex: filterQuery.search, $options: "i" } },
      { "shippingAddress.phone": { $regex: filterQuery.search, $options: "i" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "name email phone").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter)
  ]);
  return { orders, meta: paginationMeta(page, limit, total) };
}
async function updateOrderStatus(orderNumber, input, adminUserId, ipAddress) {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError("Order");
  if (order.orderStatus === input.status) {
    if (input.note) {
      order.statusHistory.push({
        status: input.status,
        timestamp: /* @__PURE__ */ new Date(),
        note: input.note,
        updatedBy: new import_mongoose29.default.Types.ObjectId(adminUserId)
      });
      await order.save();
    }
    return order;
  }
  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];
  if (!allowedTransitions.includes(input.status)) {
    throw new ValidationError(
      `Cannot transition order from '${order.orderStatus}' to '${input.status}'. Allowed: ${allowedTransitions.join(", ") || "none"}`
    );
  }
  const prevStatus = order.orderStatus;
  order.orderStatus = input.status;
  if (input.status === "confirmed" && order.paymentStatus === "pending") {
    order.paymentStatus = "paid";
  }
  order.statusHistory.push({
    status: input.status,
    timestamp: /* @__PURE__ */ new Date(),
    note: input.note || `Status updated to ${input.status} by admin`,
    updatedBy: new import_mongoose29.default.Types.ObjectId(adminUserId)
  });
  if (input.status === "cancelled") {
    order.cancelledAt = /* @__PURE__ */ new Date();
    order.cancellationReason = input.note || "Cancelled by admin";
    await releaseOrderReservations(order.items);
  } else if (input.status === "delivered") {
    order.deliveredAt = /* @__PURE__ */ new Date();
  }
  await order.save();
  await logAction({
    action: "ORDER_STATUS_UPDATE",
    entity: "Order",
    entityId: order._id.toString(),
    performedBy: adminUserId,
    performedByRole: "admin",
    ipAddress,
    changes: {
      before: { orderStatus: prevStatus },
      after: { orderStatus: input.status }
    },
    metadata: { orderNumber, note: input.note }
  });
  return order;
}
async function addShipmentDetails(orderNumber, input, adminUserId, ipAddress) {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError("Order");
  order.shippingCarrier = input.carrier;
  order.trackingNumber = input.trackingNumber;
  if (input.estimatedDelivery) {
    order.estimatedDelivery = new Date(input.estimatedDelivery);
  }
  order.shippedAt = /* @__PURE__ */ new Date();
  order.orderStatus = "shipped";
  order.statusHistory.push({
    status: "shipped",
    timestamp: /* @__PURE__ */ new Date(),
    note: `Dispatched via ${input.carrier} tracking #${input.trackingNumber}`,
    updatedBy: new import_mongoose29.default.Types.ObjectId(adminUserId)
  });
  await order.save();
  await logAction({
    action: "ORDER_SHIPMENT_DISPATCH",
    entity: "Order",
    entityId: order._id.toString(),
    performedBy: adminUserId,
    performedByRole: "admin",
    ipAddress,
    metadata: {
      orderNumber,
      carrier: input.carrier,
      trackingNumber: input.trackingNumber
    }
  });
  if (input.notifyCustomer) {
    const recipientEmail = order.guestEmail || "customer@evee.pk";
    const recipientName = order.guestName || order.shippingAddress.fullName;
    sendShipmentEmail(
      recipientEmail,
      recipientName,
      order.orderNumber,
      input.carrier,
      input.trackingNumber
    ).catch((err) => logger.error("Shipment notification email failed:", err));
  }
  return order;
}
async function confirmCodOrder(orderNumber, adminUserId, ipAddress) {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new NotFoundError("Order");
  if (order.paymentProvider !== "cod") {
    throw new AppError("This endpoint is only for Cash on Delivery orders", 400);
  }
  order.orderStatus = "confirmed";
  order.statusHistory.push({
    status: "confirmed",
    timestamp: /* @__PURE__ */ new Date(),
    note: "COD order confirmed by admin after customer verification",
    updatedBy: new import_mongoose29.default.Types.ObjectId(adminUserId)
  });
  await order.save();
  await logAction({
    action: "COD_ORDER_CONFIRMATION",
    entity: "Order",
    entityId: order._id.toString(),
    performedBy: adminUserId,
    performedByRole: "admin",
    ipAddress,
    metadata: { orderNumber }
  });
  return order;
}
async function getCustomers(page = 1, limit = 20, search, role) {
  const filter = {};
  if (role && role !== "all") {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-refreshTokens"),
    User.countDocuments(filter)
  ]);
  return { customers, meta: paginationMeta(page, limit, total) };
}
async function updateCustomerStatus(customerId, input, adminUserId, ipAddress) {
  const customer = await User.findById(customerId);
  if (!customer) throw new NotFoundError("Customer");
  const prevStatus = customer.accountStatus;
  customer.accountStatus = input.accountStatus;
  await customer.save();
  await logAction({
    action: "CUSTOMER_STATUS_UPDATE",
    entity: "User",
    entityId: customer._id.toString(),
    performedBy: adminUserId,
    performedByRole: "admin",
    ipAddress,
    changes: {
      before: { accountStatus: prevStatus },
      after: { accountStatus: input.accountStatus }
    },
    metadata: { reason: input.reason }
  });
  return customer;
}
async function adjustStock(input, adminUserId, ipAddress) {
  const delta = input.change ?? input.quantityDelta ?? 0;
  const note = input.reason ?? input.note;
  let sku = input.sku;
  if (!sku) {
    const prod = await Promise.resolve().then(() => (init_models(), models_exports)).then((m) => m.Product.findById(input.productId).select("sku"));
    sku = prod?.sku ?? "UNKNOWN";
  }
  await adjustInventory({
    productId: input.productId,
    variantId: input.variantId,
    sku,
    quantityDelta: delta,
    movementType: input.movementType ?? "adjustment",
    note,
    performedBy: adminUserId
  });
  await logAction({
    action: "INVENTORY_STOCK_ADJUSTMENT",
    entity: "Product",
    entityId: input.productId,
    performedBy: adminUserId,
    performedByRole: "admin",
    ipAddress,
    metadata: {
      sku,
      quantityDelta: delta,
      movementType: input.movementType ?? "adjustment",
      note
    }
  });
}

// src/modules/admin/admin.controller.ts
async function getOrders2(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const status = req.query.status;
    const search = req.query.search;
    const result = await getOrders(page, limit, { status, search });
    successResponse(res, { orders: result.orders }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}
async function updateOrderStatus2(req, res, next) {
  try {
    const order = await updateOrderStatus(
      req.params.orderNumber,
      req.body,
      req.user.userId,
      req.ip
    );
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}
async function addShipmentDetails2(req, res, next) {
  try {
    const order = await addShipmentDetails(
      req.params.orderNumber,
      req.body,
      req.user.userId,
      req.ip
    );
    successResponse(res, { order });
  } catch (err) {
    next(err);
  }
}
async function confirmCodOrder2(req, res, next) {
  try {
    const order = await confirmCodOrder(
      req.params.orderNumber,
      req.user.userId,
      req.ip
    );
    successResponse(res, { order }, { message: "COD order confirmed" });
  } catch (err) {
    next(err);
  }
}
async function getCustomers2(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const search = req.query.search;
    const role = req.query.role;
    const result = await getCustomers(page, limit, search, role);
    successResponse(res, { customers: result.customers }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}
async function updateCustomerStatus2(req, res, next) {
  try {
    const customer = await updateCustomerStatus(
      req.params.id,
      req.body,
      req.user.userId,
      req.ip
    );
    successResponse(res, { customer });
  } catch (err) {
    next(err);
  }
}
async function adjustStock2(req, res, next) {
  try {
    await adjustStock(req.body, req.user.userId, req.ip);
    successResponse(res, null, { message: "Stock successfully adjusted" });
  } catch (err) {
    next(err);
  }
}
async function getAuditLogsHandler(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const result = await getAuditLogs(page, limit);
    successResponse(res, { logs: result.logs }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}

// src/modules/admin/admin.validators.ts
var import_zod11 = require("zod");
var updateOrderStatusSchema = import_zod11.z.object({
  status: import_zod11.z.enum([
    "pending_payment",
    "confirmed",
    "processing",
    "ready_to_ship",
    "shipped",
    "delivered",
    "cancelled",
    "partially_refunded",
    "refunded"
  ]),
  note: import_zod11.z.string().trim().max(500, "Status note cannot exceed 500 characters").optional()
});
var addShipmentDetailsSchema = import_zod11.z.object({
  carrier: import_zod11.z.string().trim().min(2, "Carrier name must be at least 2 characters").max(100),
  trackingNumber: import_zod11.z.string().trim().min(2, "Tracking number must be at least 2 characters").max(100),
  estimatedDelivery: import_zod11.z.string().datetime().or(import_zod11.z.date()).optional(),
  notifyCustomer: import_zod11.z.boolean().default(true)
});
var adjustStockSchema = import_zod11.z.object({
  productId: import_zod11.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ObjectId format"),
  variantId: import_zod11.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Variant ObjectId format").optional(),
  sku: import_zod11.z.string().trim().optional(),
  // Accept both naming conventions
  quantityDelta: import_zod11.z.number().int().optional(),
  change: import_zod11.z.number().int().optional(),
  movementType: import_zod11.z.enum(["restock", "adjustment", "return", "damage"]).default("adjustment"),
  reason: import_zod11.z.string().trim().max(300).optional(),
  note: import_zod11.z.string().trim().max(300, "Note cannot exceed 300 characters").optional()
}).refine((d) => d.quantityDelta !== void 0 || d.change !== void 0, {
  message: "Either quantityDelta or change is required",
  path: ["quantityDelta"]
});
var updateCustomerStatusSchema = import_zod11.z.object({
  accountStatus: import_zod11.z.enum(["active", "suspended"]),
  reason: import_zod11.z.string().trim().max(300, "Reason cannot exceed 300 characters").optional()
});

// src/modules/admin/admin.routes.ts
var adminRouter = (0, import_express13.Router)();
adminRouter.use(authenticate, authorize("admin"));
adminRouter.get("/orders", getOrders2);
adminRouter.patch(
  "/orders/:orderNumber/status",
  validate(updateOrderStatusSchema),
  updateOrderStatus2
);
adminRouter.post(
  "/orders/:orderNumber/shipment",
  validate(addShipmentDetailsSchema),
  addShipmentDetails2
);
adminRouter.post("/orders/:orderNumber/confirm-cod", confirmCodOrder2);
adminRouter.get("/customers", getCustomers2);
adminRouter.patch(
  "/customers/:id/status",
  validate(updateCustomerStatusSchema),
  updateCustomerStatus2
);
adminRouter.post("/inventory/adjust", validate(adjustStockSchema), adjustStock2);
adminRouter.get("/audit-logs", getAuditLogsHandler);

// src/modules/analytics/analytics.routes.ts
var import_express14 = require("express");

// src/modules/analytics/analytics.service.ts
init_models();
async function getDashboardOverview(startDate, endDate) {
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = startDate;
    if (endDate) dateFilter.createdAt.$lte = endDate;
  }
  const [orderStats, paidSalesStats] = await Promise.all([
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] }
          },
          unpaidOrders: {
            $sum: { $cond: [{ $ne: ["$paymentStatus", "paid"] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "pending_payment"] }, 1, 0] }
          }
        }
      }
    ]),
    Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: { $in: ["paid", "partially_refunded", "refunded"] }
        }
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: "$grandTotal" },
          totalRefunds: { $sum: "$refundedAmount" }
        }
      }
    ])
  ]);
  const stats = orderStats[0] || {
    totalOrders: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    pendingOrders: 0
  };
  const sales = paidSalesStats[0] || { grossSales: 0, totalRefunds: 0 };
  const netSales = Math.max(0, sales.grossSales - sales.totalRefunds);
  return {
    totalOrders: stats.totalOrders,
    grossSales: sales.grossSales,
    netSales,
    totalRefunds: sales.totalRefunds,
    paidOrdersCount: stats.paidOrders,
    unpaidOrdersCount: stats.unpaidOrders,
    pendingOrdersCount: stats.pendingOrders
  };
}
async function getBestSellingProducts(limit = 5) {
  return Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(limit).select("name slug sku basePrice soldCount averageRating images");
}
async function getLowStockProducts(threshold = 5) {
  return Product.find({
    isActive: true,
    inventoryPolicy: "track",
    inventory: { $lte: threshold }
  }).select("name slug sku inventory reservedInventory basePrice colorVariants").sort({ inventory: 1 });
}
async function getSalesByDate(days = 30) {
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - days);
  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        paymentStatus: { $in: ["paid", "partially_refunded", "refunded"] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$grandTotal" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  return stats.map((s) => ({
    date: s._id,
    sales: s.sales,
    orders: s.orders
  }));
}

// src/modules/analytics/analytics.controller.ts
async function getOverview(req, res, next) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
    const overview = await getDashboardOverview(startDate, endDate);
    successResponse(res, { overview });
  } catch (err) {
    next(err);
  }
}
async function getBestSellers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || "5", 10);
    const products = await getBestSellingProducts(limit);
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}
async function getLowStock(req, res, next) {
  try {
    const threshold = parseInt(req.query.threshold || "5", 10);
    const products = await getLowStockProducts(threshold);
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}
async function getRevenueTrends(req, res, next) {
  try {
    const days = parseInt(req.query.days || "30", 10);
    const trends = await getSalesByDate(days);
    successResponse(res, { trends });
  } catch (err) {
    next(err);
  }
}

// src/modules/analytics/analytics.routes.ts
var analyticsRouter = (0, import_express14.Router)();
analyticsRouter.use(authenticate, authorize("admin"));
analyticsRouter.get("/overview", getOverview);
analyticsRouter.get("/best-sellers", getBestSellers);
analyticsRouter.get("/low-stock", getLowStock);
analyticsRouter.get("/trends", getRevenueTrends);

// src/modules/shipping/shipping.routes.ts
var import_express15 = require("express");

// src/modules/shipping/shipping.service.ts
var import_mongoose30 = __toESM(require("mongoose"));
init_models();
init_AppError();
async function getShippingZones(isAdmin = false) {
  const filter = isAdmin ? {} : { isActive: true };
  return ShippingZone.find(filter);
}
async function calculateShippingOptions(country, _city, subtotal = 0) {
  if (import_mongoose30.default.connection.readyState !== 1) {
    return [
      {
        name: "Standard Vehicle Delivery",
        description: "Secure carrier transit across Pakistan",
        price: 5e5,
        calculatedFee: 5e5,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        isActive: true
      }
    ];
  }
  const zone = await ShippingZone.findOne({
    countries: country.toUpperCase(),
    isActive: true
  });
  if (!zone) {
    return [
      {
        name: "Standard Vehicle Delivery",
        description: "Secure carrier transit across Pakistan",
        price: 5e5,
        // 5,000 PKR in paisa
        calculatedFee: 5e5,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        isActive: true
      }
    ];
  }
  const isFree = zone.freeShippingThreshold && zone.freeShippingThreshold > 0 && subtotal >= zone.freeShippingThreshold;
  return zone.methods.filter((m) => m.isActive).map((m) => ({
    ...m.toObject ? m.toObject() : m,
    calculatedFee: isFree ? 0 : m.price
  }));
}
async function createShippingZone(data) {
  return ShippingZone.create(data);
}
async function updateShippingZone(id, data) {
  const zone = await ShippingZone.findByIdAndUpdate(id, data, { new: true });
  if (!zone) throw new NotFoundError("Shipping Zone");
  return zone;
}
async function deleteShippingZone(id) {
  const zone = await ShippingZone.findByIdAndDelete(id);
  if (!zone) throw new NotFoundError("Shipping Zone");
}

// src/modules/shipping/shipping.controller.ts
async function getShippingZones2(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const zones = await getShippingZones(isAdmin);
    successResponse(res, { zones });
  } catch (err) {
    next(err);
  }
}
async function calculateShipping(req, res, next) {
  try {
    const country = req.query.country || "PK";
    const city = req.query.city;
    const subtotal = parseInt(req.query.subtotal || "0", 10);
    const methods = await calculateShippingOptions(country, city, subtotal);
    successResponse(res, { methods });
  } catch (err) {
    next(err);
  }
}
async function createShippingZone2(req, res, next) {
  try {
    const zone = await createShippingZone(req.body);
    successResponse(res, { zone }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}
async function updateShippingZone2(req, res, next) {
  try {
    const zone = await updateShippingZone(req.params.id, req.body);
    successResponse(res, { zone });
  } catch (err) {
    next(err);
  }
}
async function deleteShippingZone2(req, res, next) {
  try {
    await deleteShippingZone(req.params.id);
    successResponse(res, null, { message: "Shipping zone deleted" });
  } catch (err) {
    next(err);
  }
}

// src/modules/shipping/shipping.validators.ts
var import_zod12 = require("zod");
var shippingMethodInputSchema = import_zod12.z.object({
  name: import_zod12.z.string().trim().min(2, "Name must be at least 2 characters"),
  description: import_zod12.z.string().trim().optional(),
  price: import_zod12.z.number().int("Price must be an integer in paisa").min(0, "Price must be non-negative"),
  estimatedDaysMin: import_zod12.z.number().int().min(0),
  estimatedDaysMax: import_zod12.z.number().int().min(0),
  isActive: import_zod12.z.boolean().default(true),
  restrictions: import_zod12.z.object({
    maxWeight: import_zod12.z.number().optional(),
    productTypes: import_zod12.z.array(import_zod12.z.string()).optional(),
    requiresPickup: import_zod12.z.boolean().optional()
  }).optional()
});
var createShippingZoneSchema = import_zod12.z.object({
  name: import_zod12.z.string().trim().min(2).max(100),
  description: import_zod12.z.string().trim().optional(),
  countries: import_zod12.z.array(
    import_zod12.z.string().length(2, "Country code must be exactly 2 characters").toUpperCase().regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters (e.g. PK)")
  ).min(1, "At least one country is required"),
  cities: import_zod12.z.array(import_zod12.z.string().trim()).default([]),
  methods: import_zod12.z.array(shippingMethodInputSchema).min(1, "At least one shipping method is required"),
  freeShippingThreshold: import_zod12.z.number().int().min(0).default(0),
  isActive: import_zod12.z.boolean().default(true)
});
var updateShippingZoneSchema = createShippingZoneSchema.partial();
var calculateShippingSchema = import_zod12.z.object({
  country: import_zod12.z.string().length(2, "Country code must be exactly 2 characters (e.g. PK)").toUpperCase().regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters (e.g. PK)").default("PK"),
  city: import_zod12.z.string().trim().optional(),
  subtotal: import_zod12.z.string().optional().transform((v) => v ? parseInt(v, 10) : 0).or(import_zod12.z.number().int().min(0).default(0))
});

// src/modules/shipping/shipping.routes.ts
var shippingRouter = (0, import_express15.Router)();
shippingRouter.get(
  "/calculate",
  validate(calculateShippingSchema, "query"),
  calculateShipping
);
shippingRouter.get("/zones", authenticate, authorize("admin"), getShippingZones2);
shippingRouter.post(
  "/zones",
  authenticate,
  authorize("admin"),
  validate(createShippingZoneSchema),
  createShippingZone2
);
shippingRouter.patch(
  "/zones/:id",
  authenticate,
  authorize("admin"),
  validate(updateShippingZoneSchema),
  updateShippingZone2
);
shippingRouter.delete(
  "/zones/:id",
  authenticate,
  authorize("admin"),
  deleteShippingZone2
);

// src/modules/contact/contact.routes.ts
var import_express16 = require("express");
var import_zod13 = require("zod");
init_models();
var contactRouter = (0, import_express16.Router)();
var submitSchema = import_zod13.z.object({
  name: import_zod13.z.string().trim().min(2).max(100),
  email: import_zod13.z.string().trim().email().toLowerCase(),
  phone: import_zod13.z.string().trim().optional(),
  subject: import_zod13.z.string().trim().min(2).max(200),
  message: import_zod13.z.string().trim().min(5).max(2e3),
  requestType: import_zod13.z.enum(["contact", "booking", "test_ride", "service"]).default("contact")
});
contactRouter.post("/", async (req, res, next) => {
  try {
    const body = submitSchema.parse(req.body);
    const contact = await ContactRequest.create({
      ...body,
      ipAddress: req.ip
    });
    successResponse(res, { contact }, { statusCode: 201, message: "Request submitted. Our team will contact you shortly." });
  } catch (err) {
    next(err);
  }
});
contactRouter.get("/my-requests", authenticate, async (req, res, next) => {
  try {
    const { User: User2 } = await Promise.resolve().then(() => (init_models(), models_exports));
    const user = await User2.findById(req.user.userId);
    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }
    const requests = await ContactRequest.find({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });
    successResponse(res, { requests });
  } catch (err) {
    next(err);
  }
});
contactRouter.get("/", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const status = req.query.status;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const requests = await ContactRequest.find(filter).sort({ createdAt: -1 }).limit(100);
    const total = await ContactRequest.countDocuments(filter);
    const newCount = await ContactRequest.countDocuments({ status: "new" });
    successResponse(res, { requests, total, newCount });
  } catch (err) {
    next(err);
  }
});
contactRouter.patch("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const { status, adminNote, adminReplyTime, adminReplyLocation } = req.body;
    const contact = await ContactRequest.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, error: "Request not found" });
      return;
    }
    if (status) contact.status = status;
    if (adminNote !== void 0) contact.adminNote = adminNote;
    if (adminReplyTime) contact.adminReplyTime = new Date(adminReplyTime);
    if (adminReplyLocation !== void 0) contact.adminReplyLocation = adminReplyLocation;
    await contact.save();
    successResponse(res, { contact }, { message: "Request updated successfully" });
  } catch (err) {
    next(err);
  }
});

// src/modules/upload/upload.routes.ts
var import_express17 = require("express");
var import_multer = __toESM(require("multer"));

// src/common/services/imagekit.service.ts
var import_imagekit = __toESM(require("imagekit"));
init_config();
var imagekitInstance = null;
function getImageKit() {
  if (!imagekitInstance) {
    imagekitInstance = new import_imagekit.default({
      privateKey: config.imagekit.privateKey,
      publicKey: config.imagekit.publicKey,
      urlEndpoint: config.imagekit.urlEndpoint
    });
  }
  return imagekitInstance;
}
async function uploadToImageKit(file, fileName, folder = "/evee-uploads") {
  const ik = getImageKit();
  try {
    const response = await ik.upload({
      file,
      fileName,
      folder,
      useUniqueFileName: true
    });
    logger.info(`[ImageKit] Successfully uploaded image: ${response.url}`);
    return {
      fileId: response.fileId,
      name: response.name,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      filePath: response.filePath
    };
  } catch (error) {
    logger.error(`[ImageKit] Upload failed: ${error.message || error}`);
    throw new Error(error.message || "ImageKit upload failed");
  }
}
function getImageKitAuth() {
  const ik = getImageKit();
  return ik.getAuthenticationParameters();
}

// src/modules/upload/upload.routes.ts
var uploadRouter = (0, import_express17.Router)();
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
uploadRouter.post(
  "/",
  authenticate,
  upload.single("file"),
  async (req, res, next) => {
    try {
      let fileData;
      let fileName = "upload_" + Date.now();
      const folder = req.body?.folder || "/evee-uploads";
      if (req.file) {
        fileData = req.file.buffer;
        fileName = req.file.originalname || fileName;
      } else if (req.body?.file) {
        fileData = req.body.file;
        if (req.body.fileName) fileName = req.body.fileName;
      }
      if (!fileData) {
        res.status(400).json({ success: false, error: "No image file or base64 data provided" });
        return;
      }
      const result = await uploadToImageKit(fileData, fileName, folder);
      successResponse(res, result, { statusCode: 201, message: "Image uploaded successfully" });
    } catch (err) {
      next(err);
    }
  }
);
uploadRouter.get("/auth", authenticate, (req, res) => {
  const authParams = getImageKitAuth();
  successResponse(res, authParams);
});

// src/docs/swagger.ts
var import_express18 = require("express");
var swaggerRouter = (0, import_express18.Router)();
swaggerRouter.get("/", (_req, res) => {
  res.json({
    name: "EVee Crown Motors API Documentation",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      products: "/api/v1/products",
      categories: "/api/v1/categories",
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      orders: "/api/v1/orders",
      cart: "/api/v1/cart",
      checkout: "/api/v1/checkout",
      upload: "/api/v1/upload"
    }
  });
});
swaggerRouter.get("/json", (_req, res) => {
  res.json({
    openapi: "3.0.3",
    info: { title: "EVee API", version: "1.0.0" }
  });
});

// src/app.ts
function createApp() {
  const app2 = (0, import_express19.default)();
  app2.set("trust proxy", 1);
  app2.use((0, import_helmet.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app2.use((0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin || config.server.corsOrigins.includes("*") || config.server.corsOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposedHeaders: ["X-Request-ID"]
  }));
  app2.use("/api/v1/payments/stripe/webhook", import_express19.default.raw({ type: "application/json" }));
  app2.use(import_express19.default.json({ limit: "10mb" }));
  app2.use(import_express19.default.urlencoded({ extended: true, limit: "10mb" }));
  app2.use((0, import_cookie_parser.default)(config.cookie.secret));
  app2.use((0, import_compression.default)());
  app2.use((req, _res, next) => {
    if (req.body && typeof req.body === "object") {
      import_express_mongo_sanitize.default.sanitize(req.body);
    }
    if (req.params && typeof req.params === "object") {
      import_express_mongo_sanitize.default.sanitize(req.params);
    }
    next();
  });
  app2.use(requestIdMiddleware);
  if (!config.isTest) {
    app2.use((0, import_morgan.default)(config.isProduction ? "combined" : "dev", {
      stream: { write: (message) => logger.http(message.trim()) }
    }));
  }
  app2.get("/", (_req, res) => {
    res.json({
      success: true,
      service: "EVee Crown Motors API",
      version: "1.0.0",
      status: "online",
      endpoints: {
        health: "/api/v1/health",
        docs: "/api/docs"
      }
    });
  });
  app2.get("/api", (_req, res) => {
    res.json({
      success: true,
      service: "EVee Crown Motors API Gateway",
      version: "1.0.0"
    });
  });
  app2.use("/api/", generalLimiter);
  app2.use("/api/v1", healthRouter);
  app2.use("/health", healthRouter);
  app2.use("/api/v1/auth", authRouter);
  app2.use("/api/v1/users", userRouter);
  app2.use("/api/v1/products", productRouter);
  app2.use("/api/v1/categories", categoryRouter);
  app2.use("/api/v1/cart", cartRouter);
  app2.use("/api/v1/checkout", checkoutRouter);
  app2.use("/api/v1/orders", orderRouter);
  app2.use("/api/v1/payments", paymentRouter);
  app2.use("/api/v1/coupons", couponRouter);
  app2.use("/api/v1/reviews", reviewRouter);
  app2.use("/api/v1/wishlist", wishlistRouter);
  app2.use("/api/v1/admin", adminRouter);
  app2.use("/api/v1/analytics", analyticsRouter);
  app2.use("/api/v1/shipping", shippingRouter);
  app2.use("/api/v1/contact", contactRouter);
  app2.use("/api/v1/upload", uploadRouter);
  app2.use("/api/docs", swaggerRouter);
  app2.use(notFoundHandler);
  app2.use(errorHandler);
  return app2;
}

// src/config/database.ts
var import_mongoose31 = __toESM(require("mongoose"));
var import_dns = __toESM(require("dns"));
init_config();
if (!process.env.VERCEL && process.platform === "win32") {
  try {
    import_dns.default.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
  }
}
var isConnected = false;
async function connectDatabase() {
  if (isConnected) return;
  import_mongoose31.default.set("strictQuery", true);
  try {
    await import_mongoose31.default.connect(config.db.uri, {
      dbName: config.db.name,
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 45e3
    });
    isConnected = true;
    logger.info(`MongoDB connected: ${config.db.name}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
}
import_mongoose31.default.connection.on("disconnected", () => {
  isConnected = false;
  logger.warn("MongoDB disconnected");
});
import_mongoose31.default.connection.on("error", (error) => {
  logger.error("MongoDB error:", error);
});

// api/index.ts
var app = createApp();
var dbPromise = null;
function ensureDb() {
  if (!dbPromise) {
    dbPromise = connectDatabase().catch((err) => {
      dbPromise = null;
      console.error("[MongoDB] Connection failed:", err?.message || err);
      throw err;
    });
  }
  return dbPromise;
}
app.use(async (_req, _res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});
var index_default = app;

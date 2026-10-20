# EVee E-Commerce API — Frontend Developer Guide
### Crown Motors | Complete REST API Reference & Integration Manual

> **Frontend Developer ke liye complete guide:** Is document mein EVee backend ki saari APIs, unka URL, HTTP Method, Authentication requirement (Public / Customer / Admin), Request Body ka format, Response ka format aur Axios/Fetch ke code examples diye gaye hain.

---

## 1. Quick Integration Rules (Zaroori Baatein)

### Base URL:
```
http://localhost:5000/api/v1
```
*(Production mein ye aapke domain se replace hoga, e.g. `https://api.evee.pk/api/v1`)*

### Interactive Swagger Docs:
Aap browser mein live APIs test kar sakte hain:
```
http://localhost:5000/api/docs
```

### Authentication & Cookies:
- Backend **HttpOnly, Secure Cookies** use karta hai (`accessToken` aur `refreshToken`).
- **Axios Setup**: Aapko har request mein `withCredentials: true` lazmi bhejna hai taake cookies automatic save aur send hon:
  ```javascript
  import axios from 'axios';

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true, // Zaroori hai cookies ke liye!
    headers: {
      'Content-Type': 'application/json',
    },
  });
  export default api;
  ```
- **Fetch API Setup**: Agar `fetch` use kar rahe hain to `credentials: 'include'` lagayein:
  ```javascript
  fetch('http://localhost:5000/api/v1/auth/me', {
    credentials: 'include',
  });
  ```
- **Authorization Header (Alternative)**: Agar mobile app ya custom client hai to Bearer token bhi support karta hai:
  `Authorization: Bearer <accessToken>`

### Guest Cart (Baghair Login Cart):
- Agar user logged in nahi hai to shopping cart maintain karne ke liye frontend ek unique ID (UUID) generate kare aur har request ke header mein bheje:
  `x-session-id: <uuid>`

### Currency & Prices (Paisa Unit):
- Backend mein currency **smallest unit (Paisa)** mein calculate hoti hai taake rounding error na aye:
  - **1 PKR = 100 Paisa**
  - Example: `285,000 PKR` backend mein `28500000` hota hai.
  - **Frontend formula**:
    - Backend se show karne ke liye: `priceInPKR = price / 100`
    - Backend ko bhejne ke liye: `priceInSubunit = priceInPKR * 100`

### Standard Response Format:
**Success (200 / 201):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { "page": 1, "limit": 12, "total": 45, "totalPages": 4 }
}
```

**Error (400 / 401 / 403 / 404 / 422):**
```json
{
  "success": false,
  "error": "Password must contain at least one special character (!@#$%^&*)", // Direct Toast / Alert message ke liye
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "password",
      "message": "Password must contain at least one special character (!@#$%^&*)" // Form input ke neeche red text ke liye
    }
  ]
}
```
> **Frontend Tip**: Toast alert mein `res.data.error` show karein, aur form inputs ke neeche red error ke liye `res.data.details` map karein!

---

## 2. API Summary Table (Saari APIs ki List)

| Module | Method | Endpoint | Auth Required? | Role | Description |
|---|---|---|---|---|---|
| **System** | `GET` | `/health` | ❌ No | Public | Server & Database health status |
| **Auth** | `POST` | `/auth/register` | ❌ No | Public | New user register karna |
| **Auth** | `POST` | `/auth/login` | ❌ No | Public | Email aur password se login |
| **Auth** | `POST` | `/auth/logout` | ✅ Yes | Customer / Admin | Logout aur cookies clear |
| **Auth** | `POST` | `/auth/refresh` | ❌ No (Cookie) | Public | Refresh token se naya access token lena |
| **Auth** | `POST` | `/auth/forgot-password`| ❌ No | Public | Password reset email mangwana |
| **Auth** | `POST` | `/auth/reset-password` | ❌ No | Public | Naya password set karna token ke zariye |
| **Auth** | `POST` | `/auth/verify-email` | ❌ No | Public | Email verify karna |
| **Auth** | `GET` | `/auth/me` | ✅ Yes | Customer / Admin | Current logged-in user ki profile |
| **User** | `GET` | `/users/profile` | ✅ Yes | Customer | User profile data |
| **User** | `PATCH`| `/users/profile` | ✅ Yes | Customer | Name ya phone update karna |
| **User** | `GET` | `/users/addresses` | ✅ Yes | Customer | Saved address list |
| **User** | `POST` | `/users/addresses` | ✅ Yes | Customer | Naya delivery address save karna |
| **User** | `PATCH`| `/users/addresses/:addressId` | ✅ Yes | Customer | Address update karna |
| **User** | `DELETE`| `/users/addresses/:addressId`| ✅ Yes | Customer | Address delete karna |
| **User** | `GET` | `/users/orders` | ✅ Yes | Customer | User ki apni order history |
| **User** | `GET` | `/users/orders/:orderNumber` | ✅ Yes | Customer | Kisi specific order ki full details |
| **Products**| `GET` | `/products` | ❌ No | Public | Products list (filters, sort, pagination) |
| **Products**| `GET` | `/products/featured` | ❌ No | Public | Homepage ke featured electric bikes |
| **Products**| `GET` | `/products/search` | ❌ No | Public | Search products by text |
| **Products**| `GET` | `/products/:slug` | ❌ No | Public | Product details by slug (e.g. `evee-pro-125`) |
| **Products**| `GET` | `/products/:id/related` | ❌ No | Public | Similar/related electric bikes |
| **Products**| `POST` | `/products` | ✅ Yes | **Admin** | Naya product create karna |
| **Products**| `PATCH`| `/products/:id` | ✅ Yes | **Admin** | Product update karna |
| **Products**| `PATCH`| `/products/:id/archive` | ✅ Yes | **Admin** | Product archive (deactivate) karna |
| **Products**| `DELETE`| `/products/:id` | ✅ Yes | **Admin** | Product delete karna |
| **Categories**| `GET`| `/categories` | ❌ No | Public | Saari categories ki list |
| **Categories**| `GET`| `/categories/:slug` | ❌ No | Public | Category detail by slug |
| **Categories**| `POST`| `/categories` | ✅ Yes | **Admin** | Nayi category banana |
| **Categories**| `PATCH`| `/categories/:id` | ✅ Yes | **Admin** | Category update karna |
| **Categories**| `DELETE`| `/categories/:id` | ✅ Yes | **Admin** | Category deactivate karna |
| **Cart** | `GET` | `/cart` | ❌ Optional | Public / Guest | Current cart items aur totals |
| **Cart** | `POST` | `/cart/items` | ❌ Optional | Public / Guest | Cart mein bike/accessory add karna |
| **Cart** | `PATCH`| `/cart/items/:itemId` | ❌ Optional | Public / Guest | Quantity barhana ya ghatana (0 = remove) |
| **Cart** | `DELETE`| `/cart/items/:itemId`| ❌ Optional | Public / Guest | Cart item remove karna |
| **Cart** | `DELETE`| `/cart` | ❌ Optional | Public / Guest | Pura cart khali karna |
| **Checkout**| `POST`| `/checkout/validate` | ❌ Optional | Public / Guest | Calculations check karna (discount, tax, total) |
| **Checkout**| `POST`| `/checkout/create-order`| ❌ Optional | Public / Guest | Final order place karna & Stripe/COD flow shuru |
| **Orders** | `GET` | `/orders/track/:orderNumber` | ❌ No | Public | Tracking status dekhna (carrier, tracking #) |
| **Orders** | `GET` | `/orders/:orderNumber` | ❌ Optional | Customer | Order details dekhna |
| **Orders** | `POST` | `/orders/:orderNumber/cancel`| ✅ Yes | Customer | Order cancel karna (agar shipped nahi hua) |
| **Payments**| `POST` | `/payments/stripe/webhook` | ❌ No | Stripe Service | Stripe backend webhook (browser se call nahi karna) |
| **Payments**| `GET` | `/payments/:orderNumber/status`| ❌ No | Public | Success page par payment status verify karna |
| **Payments**| `POST` | `/payments/:orderNumber/refund`| ✅ Yes | **Admin** | Order ka refund issue karna |
| **Shipping**| `GET` | `/shipping/calculate` | ❌ No | Public | Delivery charges calculate karna |
| **Shipping**| `GET` | `/shipping/zones` | ✅ Yes | **Admin** | Shipping zones dekhna |
| **Shipping**| `POST`| `/shipping/zones` | ✅ Yes | **Admin** | Naya shipping zone banana |
| **Shipping**| `PATCH`| `/shipping/zones/:id` | ✅ Yes | **Admin** | Shipping zone update karna |
| **Shipping**| `DELETE`| `/shipping/zones/:id` | ✅ Yes | **Admin** | Shipping zone delete karna |
| **Coupons** | `GET` | `/coupons/validate` | ❌ Optional | Public | Coupon code check karna (valid hai ya nahi) |
| **Coupons** | `GET` | `/coupons` | ✅ Yes | **Admin** | Saaray coupons dekhna |
| **Coupons** | `POST` | `/coupons` | ✅ Yes | **Admin** | Naya coupon banana |
| **Coupons** | `PATCH`| `/coupons/:id` | ✅ Yes | **Admin** | Coupon update karna |
| **Coupons** | `DELETE`| `/coupons/:id` | ✅ Yes | **Admin** | Coupon delete karna |
| **Reviews** | `GET` | `/reviews/product/:productId` | ❌ No | Public | Product ke approved reviews dekhna |
| **Reviews** | `POST` | `/reviews` | ✅ Yes | Customer | Naya review submit karna |
| **Reviews** | `PATCH`| `/reviews/:id/moderate` | ✅ Yes | **Admin** | Review approve ya reject karna |
| **Reviews** | `DELETE`| `/reviews/:id` | ✅ Yes | **Admin** | Review delete karna |
| **Wishlist**| `GET` | `/wishlist` | ✅ Yes | Customer | User ki saved items dekhna |
| **Wishlist**| `POST` | `/wishlist/:productId` | ✅ Yes | Customer | Item wishlist mein save karna |
| **Wishlist**| `DELETE`| `/wishlist/:productId`| ✅ Yes | Customer | Item wishlist se nikalna |
| **Admin** | `GET` | `/admin/orders` | ✅ Yes | **Admin** | Saaray orders list & filter karna |
| **Admin** | `PATCH`| `/admin/orders/:orderNumber/status` | ✅ Yes | **Admin** | Order status update (processing, shipped, delivered) |
| **Admin** | `POST` | `/admin/orders/:orderNumber/shipment` | ✅ Yes | **Admin** | Courier name aur tracking # enter karna |
| **Admin** | `POST` | `/admin/orders/:orderNumber/confirm-cod`| ✅ Yes | **Admin** | Cash on delivery order confirm karna |
| **Admin** | `GET` | `/admin/customers` | ✅ Yes | **Admin** | Registered customers list |
| **Admin** | `PATCH`| `/admin/customers/:id/status` | ✅ Yes | **Admin** | Customer suspend ya activate karna |
| **Admin** | `POST` | `/admin/inventory/adjust` | ✅ Yes | **Admin** | Stock barhana ya kam karna (audit ledger ke sath) |
| **Admin** | `GET` | `/admin/audit-logs` | ✅ Yes | **Admin** | Admin actions ki history dekhna |
| **Analytics**| `GET`| `/analytics/overview` | ✅ Yes | **Admin** | Gross sales, net revenue, total orders |
| **Analytics**| `GET`| `/analytics/best-sellers` | ✅ Yes | **Admin** | Top selling electric bikes |
| **Analytics**| `GET`| `/analytics/low-stock` | ✅ Yes | **Admin** | Jin bikes ka stock khatam hone wala hai |
| **Analytics**| `GET`| `/analytics/trends` | ✅ Yes | **Admin** | Past 30 days daily sales graph data |

---

## 3. Detailed Endpoint Guides with Examples

---

### 🔑 Authentication Module

#### 1. Register User
- **URL**: `POST /auth/register`
- **Auth**: Public (No)
- **Body**:
  ```json
  {
    "name": "Hamza Ali",
    "email": "hamza@example.com",
    "password": "Password123!",
    "phone": "+923001234567"
  }
  ```
- **Password Rules**: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number.
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Account created. Please verify your email.",
    "data": {
      "user": {
        "_id": "662...",
        "name": "Hamza Ali",
        "email": "hamza@example.com",
        "role": "customer",
        "emailVerified": false
      }
    }
  }
  ```
  *(Browser cookies `accessToken` aur `refreshToken` automatic save ho jayengi)*

---

#### 2. Login
- **URL**: `POST /auth/login`
- **Auth**: Public (No)
- **Body**:
  ```json
  {
    "email": "hamza@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "662...",
        "name": "Hamza Ali",
        "email": "hamza@example.com",
        "role": "customer"
      }
    }
  }
  ```

---

#### 3. Logout
- **URL**: `POST /auth/logout`
- **Auth**: Customer / Admin (Yes)
- **Body**: None
- **Response**: Cookies clear ho jayengi.

---

#### 4. Get Current User (`/auth/me`)
- **URL**: `GET /auth/me`
- **Auth**: Customer / Admin (Yes)
- **Use case**: App start hone par check karna ke user already logged in hai ya nahi.

---

### 🛵 Products Catalog Module

#### 1. List Products (Filters & Pagination)
- **URL**: `GET /products`
- **Auth**: Public
- **Query Parameters**:
  - `page`: default `1`
  - `limit`: default `12`
  - `category`: Category ID
  - `productType`: `motorcycle` | `scooter` | `accessory` | `part`
  - `minPrice`: in Paisa (e.g. `10000000` = 100,000 PKR)
  - `maxPrice`: in Paisa
  - `color`: e.g. `black`, `cyan`
  - `sort`: `newest` | `price_asc` | `price_desc` | `popular` | `featured` | `rating`
  - `search`: search keyword
- **Example Call**:
  `GET /products?productType=motorcycle&sort=price_asc&page=1&limit=10`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "662...",
          "name": "EVee Pro 125",
          "slug": "evee-pro-125",
          "sku": "EVE-M125-PRO",
          "productType": "motorcycle",
          "basePrice": 28500000,
          "currency": "PKR",
          "images": ["https://..."],
          "specifications": [
            { "key": "range", "label": "Claimed Range", "value": "120", "unit": "km", "group": "Performance" },
            { "key": "top_speed", "label": "Maximum Speed", "value": "85", "unit": "km/h", "group": "Performance" },
            { "key": "battery_capacity", "label": "Battery Capacity", "value": "72V 45Ah", "unit": "Ah", "group": "Battery" }
          ],
          "colorVariants": [
            {
              "_id": "662a...",
              "name": "Stealth Black",
              "colorHex": "#1a1a1a",
              "sku": "EVE-M125-PRO-BLK",
              "additionalPrice": 0,
              "inventory": 15
            },
            {
              "_id": "662b...",
              "name": "Electric Cyan",
              "colorHex": "#00d4aa",
              "sku": "EVE-M125-PRO-CYN",
              "additionalPrice": 500000,
              "inventory": 10
            }
          ],
          "inventory": 25,
          "isFeatured": true,
          "averageRating": 4.8,
          "reviewCount": 14
        }
      ]
    },
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
  ```

---

#### 2. Get Product By Slug (Product Detail Page)
- **URL**: `GET /products/:slug`
- **Example**: `GET /products/evee-pro-125`
- **Auth**: Public
- Returns complete specs, gallery images, variants, warranty, and pricing.

---

### 🛒 Shopping Cart Module

*Cart guest aur logged in dono users ke liye kaam karta hai.*

#### 1. Get Cart
- **URL**: `GET /cart`
- **Headers**:
  - Logged in user: Cookie automatic send hogi
  - Guest user: `x-session-id: <guest_uuid>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "cart": {
        "items": [
          {
            "_id": "662...",
            "product": "662...",
            "variantId": "662b...",
            "productName": "EVee Pro 125",
            "variantName": "Electric Cyan",
            "quantity": 1,
            "unitPrice": 29000000,
            "sku": "EVE-M125-PRO-CYN",
            "image": "https://..."
          }
        ],
        "subtotal": 29000000,
        "discountAmount": 0,
        "couponCode": null,
        "estimatedTotal": 29000000
      }
    }
  }
  ```

#### 2. Add Item to Cart
- **URL**: `POST /cart/items`
- **Body**:
  ```json
  {
    "productId": "662...",
    "variantId": "662b...", // optional agar color variant hai
    "quantity": 1
  }
  ```

#### 3. Update Cart Item Quantity
- **URL**: `PATCH /cart/items/:itemId`
- **Body**:
  ```json
  {
    "quantity": 2
  }
  ```
  *(Agar quantity `0` bhejein to item cart se delete ho jayega)*

#### 4. Remove Item from Cart
- **URL**: `DELETE /cart/items/:itemId`

---

### 💳 Checkout & Ordering Flow

#### Step 1: Validate Checkout (`POST /checkout/validate`)
Frontend par order place karne se pehle totals calculate karwane ke liye:
- **Body**:
  ```json
  {
    "items": [
      {
        "productId": "662...",
        "variantId": "662b...",
        "quantity": 1
      }
    ],
    "couponCode": "EVEEFIRST", // optional
    "shippingAddress": {
      "fullName": "Hamza Ali",
      "phone": "+923001234567",
      "addressLine1": "Main Boulevard, Gulberg III",
      "city": "Lahore",
      "country": "PK"
    },
    "paymentProvider": "stripe" // ya "cod"
  }
  ```
- **Response**: Server recalculated subtotal, discount, shipping fee, tax, and grandTotal return karega.

---

#### Step 2: Create Order (`POST /checkout/create-order`)
Final order create karna aur payment flow shuru karna:
- **Body**:
  ```json
  {
    "items": [
      { "productId": "662...", "variantId": "662b...", "quantity": 1 }
    ],
    "shippingAddress": {
      "fullName": "Hamza Ali",
      "phone": "+923001234567",
      "addressLine1": "House 12, Street 4, F-7/2",
      "city": "Islamabad",
      "country": "PK"
    },
    "couponCode": "EVEEFIRST",
    "paymentProvider": "stripe", // "stripe" ya "cod"
    "customerNotes": "Please deliver after 2 PM",
    "guestName": "Hamza Ali", // agar user logged in nahi hai
    "guestEmail": "hamza@example.com" // agar user logged in nahi hai
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "order": {
        "_id": "662...",
        "orderNumber": "EVE-M4N8PQ-2K8X",
        "grandTotal": 26100000,
        "currency": "PKR",
        "orderStatus": "pending_payment",
        "paymentStatus": "pending"
      },
      "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
      "sessionId": "cs_test_..."
    }
  }
  ```
- **Frontend Action**:
  - Agar `paymentProvider === "stripe"` hai to user ko `window.location.href = data.checkoutUrl` par redirect kar dein!
  - Agar `paymentProvider === "cod"` hai to direct order success page `/checkout/success?order=EVE-...` par redirect karein.

---

#### Step 3: Success Page Par Status Verify Karna
User jab payment complete karke success page par return ho:
- **URL**: `GET /payments/:orderNumber/status`
- **Example**: `GET /payments/EVE-M4N8PQ-2K8X/status`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "paymentStatus": {
        "orderNumber": "EVE-M4N8PQ-2K8X",
        "paymentStatus": "paid",
        "orderStatus": "confirmed",
        "grandTotal": 26100000,
        "currency": "PKR"
      }
    }
  }
  ```

---

### 📦 Public Order Tracking (`/orders/track/:orderNumber`)
Customer bina login kiye bhi order track kar sakta hai:
- **URL**: `GET /orders/track/EVE-M4N8PQ-2K8X`
- **Optional Query**: `?email=hamza@example.com` (additional security verify)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "tracking": {
        "orderNumber": "EVE-M4N8PQ-2K8X",
        "orderStatus": "shipped",
        "paymentStatus": "paid",
        "shippingCarrier": "Leopard Courier Express",
        "trackingNumber": "LEO-987654321",
        "estimatedDelivery": "2026-10-25T14:00:00.000Z",
        "shippedAt": "2026-10-22T09:30:00.000Z",
        "itemsSummary": [
          { "productName": "EVee Pro 125", "quantity": 1 }
        ]
      }
    }
  }
  ```

---

### 🎫 Coupons Module

#### Validate Coupon
- **URL**: `GET /coupons/validate?code=EVEEFIRST&subtotal=28500000`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "coupon": {
        "code": "EVEEFIRST",
        "discountType": "percentage",
        "discountValue": 10,
        "discountAmount": 2500000,
        "minimumOrderValue": 10000000
      }
    }
  }
  ```

---

### ⭐ Product Reviews Module

#### 1. Get Product Reviews
- **URL**: `GET /reviews/product/:productId?page=1&limit=10`
- **Auth**: Public

#### 2. Submit Review
- **URL**: `POST /reviews`
- **Auth**: Customer (Logged in)
- **Body**:
  ```json
  {
    "productId": "662...",
    "rating": 5,
    "title": "Amazing pickup and battery life!",
    "body": "Daily 40km commute in Lahore traffic without any issues. Highly recommended!"
  }
  ```

---

### ❤️ Wishlist Module

- `GET /wishlist`: User ki wishlist dekhna
- `POST /wishlist/:productId`: Bike/item wishlist mein add karna
- `DELETE /wishlist/:productId`: Wishlist se remove karna

---

### 🛡️ Admin Dashboard APIs (Admin Role Required)

Admin account login karne ke baad in APIs ko access kar sakta hai:

#### 1. List All Orders
- **URL**: `GET /admin/orders?page=1&limit=20&status=pending_payment&search=Hamza`
- **Filters**: `status` (`pending_payment`, `confirmed`, `processing`, `ready_to_ship`, `shipped`, `delivered`, `cancelled`)

#### 2. Update Order Fulfillment Status
- **URL**: `PATCH /admin/orders/:orderNumber/status`
- **Body**:
  ```json
  {
    "status": "processing",
    "note": "Vehicle assembled and scheduled for quality inspection"
  }
  ```

#### 3. Dispatch & Add Shipment Tracking
- **URL**: `POST /admin/orders/:orderNumber/shipment`
- **Body**:
  ```json
  {
    "carrier": "TCS Cargo / Freight",
    "trackingNumber": "TCS-12345678",
    "estimatedDelivery": "2026-10-25T10:00:00Z",
    "notifyCustomer": true
  }
  ```
  *(Customer ko automatic shipment notification email chali jayegi)*

#### 4. Confirm Cash on Delivery (COD) Order
- **URL**: `POST /admin/orders/:orderNumber/confirm-cod`

#### 5. Issue Refund
- **URL**: `POST /payments/:orderNumber/refund`
- **Body**:
  ```json
  {
    "amount": 28500000, // optional; agar omit karein to full refund ho jayega
    "reason": "Customer cancellation request"
  }
  ```

#### 6. Adjust Stock / Restock
- **URL**: `POST /admin/inventory/adjust`
- **Body**:
  ```json
  {
    "productId": "662...",
    "variantId": "662b...", // optional
    "sku": "EVE-M125-PRO-CYN",
    "quantityDelta": 10, // positive to add stock, negative to reduce
    "movementType": "restock", // "restock" | "adjustment" | "damage" | "return"
    "note": "Received shipment batch #4 from Crown Motors plant"
  }
  ```

#### 7. Analytics Dashboard
- `GET /analytics/overview`: Gross sales, Net revenue, Total orders, Paid vs Unpaid
- `GET /analytics/best-sellers`: Top 5 selling bikes
- `GET /analytics/low-stock`: Stock alert list
- `GET /analytics/trends?days=30`: 30 din ka sales graph data

---

## 4. Complete Frontend React / Next.js Service Example

Aap ye code direct apne frontend project mein `src/services/api.js` bana kar use kar sakte hain:

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Cookies authentication ke liye lazmi hai
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: Paise ko PKR mein convert karna
export const formatPKR = (subunitAmount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(subunitAmount / 100);
};

// --- AUTH SERVICES ---
export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};

// --- PRODUCT SERVICES ---
export const productService = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getBySlug: (slug) => apiClient.get(`/products/${slug}`),
  getFeatured: () => apiClient.get('/products/featured'),
};

// --- CART SERVICES ---
export const cartService = {
  getCart: (sessionId) => apiClient.get('/cart', { headers: { 'x-session-id': sessionId } }),
  addItem: (data, sessionId) => apiClient.post('/cart/items', data, { headers: { 'x-session-id': sessionId } }),
  updateItem: (itemId, quantity, sessionId) => apiClient.patch(`/cart/items/${itemId}`, { quantity }, { headers: { 'x-session-id': sessionId } }),
  removeItem: (itemId, sessionId) => apiClient.delete(`/cart/items/${itemId}`, { headers: { 'x-session-id': sessionId } }),
};

// --- CHECKOUT & ORDER SERVICES ---
export const checkoutService = {
  validate: (payload) => apiClient.post('/checkout/validate', payload),
  createOrder: (payload) => apiClient.post('/checkout/create-order', payload),
  getPaymentStatus: (orderNumber) => apiClient.get(`/payments/${orderNumber}/status`),
  trackOrder: (orderNumber) => apiClient.get(`/orders/track/${orderNumber}`),
};
```

---

## 5. Support & Local Testing

Agar kisi API mein issue aye to:
1. Browser mein `http://localhost:5000/api/docs` khol kar request execute karein aur exact response dekhein.
2. Server health check check karein: `http://localhost:5000/api/v1/health`.
3. Admin account credentials (from seed):
   - **Email**: `admin@evee.pk`
   - **Password**: `Admin@EVee2024!`

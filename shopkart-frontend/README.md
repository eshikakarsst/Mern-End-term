# 🛒 ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application built using **React, Node.js, Express.js, MongoDB, and Razorpay**.

The project implements customer authentication, product browsing, wishlist management, persistent shopping carts, checkout, order management, and Razorpay Test Mode payment processing.

---

## 📌 Project Overview

ShopKart provides an end-to-end shopping experience:

- Customer registration and login
- JWT-based authentication
- HttpOnly cookie authentication
- Protected routes
- Product management
- Wishlist management
- Persistent shopping cart
- Checkout and shipping address validation
- Razorpay Test Mode payment integration
- Payment verification
- Order creation and order history
- Individual order details

---

## 🏗️ Tech Stack

### Frontend

- React 18
- React Router DOM
- Axios
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- cookie-parser
- CORS

### Payment

- Razorpay Test Mode
- Razorpay Node.js SDK
- Razorpay Checkout

---

## 📂 Project Structure

```text
shopkart/
│
├── shopkart-authentication-service/
│   │
│   ├── config/
│   │   └── razorpay.js
│   │
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── order.model.js
│   │   └── product.model.js
│   │
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   │
│   ├── utils/
│   │   └── generateToken.js
│   │
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── README.md
│
├── shopkart-frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthShell.jsx
│   │   │   ├── Field.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── WishlistCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── CartContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Wishlist.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── postman/
│   ├── Lab04-Wishlist.postman_collection.json
│   ├── Lab05-Cart.postman_collection.json
│   └── Lab06-Checkout-Orders.postman_collection.json
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB
- Git
- A Razorpay account for Test Mode payments
- Postman (optional, for API testing)

Check Node.js and npm:

```bash
node -v
npm -v
```

---

# 📥 Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd shopkart
```

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd shopkart-authentication-service
```

Install dependencies:

```bash
npm install
```

The backend uses:

- Express
- MongoDB/Mongoose
- bcrypt
- JWT
- cookie-parser
- CORS
- Razorpay

---

## 🔐 Backend Environment Variables

Create a `.env` file inside:

```text
shopkart-authentication-service/
```

Add:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

FRONTEND_URLS=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_test_key_id

RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

### Important

Never commit the `.env` file to GitHub.

The `.gitignore` already excludes:

```text
.env
node_modules/
dist
```

---

# 💳 Razorpay Setup

ShopKart uses **Razorpay Test Mode** for checkout payments.

The backend initializes Razorpay using:

```javascript
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

## Step 1 — Create Razorpay Account

Create/login to your Razorpay account and switch to **Test Mode**.

From the Razorpay dashboard, obtain:

```text
Key ID
Key Secret
```

Add them to the backend `.env`:

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

### ⚠️ Important

Do **not** put:

```text
RAZORPAY_KEY_SECRET
```

in the React frontend.

The secret key must remain on the backend.

Only the Razorpay **Key ID** is sent to the frontend when creating the checkout session.

---

# 🧪 Mock Payment Mode

The application also supports a mock payment mode.

If valid Razorpay credentials are not configured, the backend can create a mock payment order so the checkout flow can still be tested locally.

This allows development of:

```text
Cart
   ↓
Checkout
   ↓
Create Order
   ↓
Payment
   ↓
Verify Payment
   ↓
Order Confirmation
```

without charging real money.

---

# ▶️ Running the Backend

From:

```text
shopkart/shopkart-authentication-service
```

run:

```bash
npm start
```

The server will run on:

```text
http://localhost:5000
```

You can verify the server by opening:

```text
http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "ShopKart Authentication API is running"
}
```

---

# 🎨 Frontend Setup

Open another terminal.

Navigate to:

```bash
cd shopkart/shopkart-frontend
```

Install dependencies:

```bash
npm install
```

---

## Frontend Environment Variables

Create:

```text
shopkart-frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

---

# ▶️ Running the Frontend

Run:

```bash
npm run dev
```

Vite will display the local development URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# 🔄 Running Both Servers

You need **two terminals**.

### Terminal 1 — Backend

```bash
cd shopkart/shopkart-authentication-service
npm install
npm start
```

### Terminal 2 — Frontend

```bash
cd shopkart/shopkart-frontend
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

---

# 🔐 Authentication Flow

ShopKart uses JWT-based authentication with an **HttpOnly cookie**.

### Registration

```text
User
 ↓
React Register Page
 ↓
POST /customers/register
 ↓
Express Controller
 ↓
Password hashed using bcrypt
 ↓
Customer stored in MongoDB
```

### Login

```text
User
 ↓
React Login Page
 ↓
POST /customers/login
 ↓
Credentials verified
 ↓
JWT generated
 ↓
JWT stored in HttpOnly cookie
```

The frontend does not need to manually store the JWT in localStorage.

---

# 🛡️ Protected Routes

Protected backend routes use:

```text
auth.middleware.js
```

The middleware:

1. Reads the authentication cookie.
2. Verifies the JWT.
3. Identifies the logged-in customer.
4. Attaches the user information to `req.user`.
5. Allows the request to continue.

Protected functionality includes:

```text
Profile
Wishlist
Cart
Checkout
Orders
```

---

# 🛍️ Main Features

## 1. Customer Authentication

- Register
- Login
- Logout
- Get current customer
- Change password
- JWT authentication
- HttpOnly cookies
- Protected routes

---

## 2. Product Management

Products can be:

- Created
- Retrieved
- Retrieved individually
- Deleted

API base route:

```text
/products
```

---

## 3. Wishlist

Authenticated customers can:

- Add products to wishlist
- View wishlist
- Remove products from wishlist

Routes:

```http
POST   /wishlist/:productId
GET    /wishlist
DELETE /wishlist/:productId
```

---

## 4. Shopping Cart

Authenticated customers can:

- Add products
- View cart
- Update quantities
- Remove products

Routes:

```http
POST   /cart/:productId
GET    /cart
PATCH  /cart/:productId
DELETE /cart/:productId
```

Cart state is also managed on the frontend using:

```text
CartContext.jsx
```

---

# 🧾 Checkout & Orders

The checkout system validates:

- Full name
- Phone number
- Address
- City
- State
- Pincode
- Cart contents
- Product availability
- Product stock

The backend calculates the final order amount from database product prices instead of trusting the frontend total.

---

# 💳 Payment Flow

The Razorpay checkout flow works as follows:

```text
Customer
   │
   ▼
Cart
   │
   ▼
Checkout Page
   │
   ▼
POST /orders/create-payment-order
   │
   ▼
Backend validates cart
   │
   ▼
ShopKart Order created
   │
   ▼
Razorpay Order created
   │
   ▼
Razorpay Checkout opens
   │
   ▼
Customer completes Test Payment
   │
   ▼
Razorpay returns payment details
   │
   ▼
POST /orders/verify-payment
   │
   ▼
Backend verifies signature
   │
   ▼
Order marked as PAID
   │
   ▼
Cart cleared
   │
   ▼
Order Details Page
```

---

# 📦 Order APIs

All order APIs are protected.

### Create Payment Order

```http
POST /orders/create-payment-order
```

Creates the ShopKart order and Razorpay order.

---

### Verify Payment

```http
POST /orders/verify-payment
```

Verifies the Razorpay payment signature and updates the order.

---

### Get Orders

```http
GET /orders
```

Returns the logged-in customer's orders.

---

### Get Individual Order

```http
GET /orders/:id
```

Returns a specific order belonging to the authenticated customer.

---

# 📡 Complete API Reference

## Customer

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/customers/register` | No |
| POST | `/customers/login` | No |
| GET | `/customers/me` | Yes |
| POST | `/customers/logout` | Yes |
| PATCH | `/customers/change-password` | Yes |

## Products

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/products` | No |
| GET | `/products` | No |
| GET | `/products/:id` | No |
| DELETE | `/products/:id` | No |

## Wishlist

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/wishlist/:productId` | Yes |
| GET | `/wishlist` | Yes |
| DELETE | `/wishlist/:productId` | Yes |

## Cart

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/cart/:productId` | Yes |
| GET | `/cart` | Yes |
| PATCH | `/cart/:productId` | Yes |
| DELETE | `/cart/:productId` | Yes |

## Orders

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/orders/create-payment-order` | Yes |
| POST | `/orders/verify-payment` | Yes |
| GET | `/orders` | Yes |
| GET | `/orders/:id` | Yes |

---

# 🧪 Postman Testing

The repository contains Postman collections for testing the APIs:

```text
postman/
├── Lab04-Wishlist.postman_collection.json
├── Lab05-Cart.postman_collection.json
└── Lab06-Checkout-Orders.postman_collection.json
```

Import the required collection into Postman.

Recommended testing sequence:

```text
1. Register
2. Login
3. Create/List Products
4. Add Product to Wishlist
5. Add Product to Cart
6. Update Cart
7. Checkout
8. Create Payment Order
9. Complete Test Payment
10. Verify Payment
11. Get Orders
12. Get Order Details
```

---

# 🧠 Engineering Concepts Demonstrated

This project demonstrates:

- REST APIs
- CRUD operations
- MVC-style backend structure
- React component architecture
- React Context API
- React Router
- Axios
- JWT authentication
- HttpOnly cookies
- Password hashing
- Middleware
- Protected routes
- MongoDB
- Mongoose
- CORS
- Environment variables
- API integration
- Persistent cart state
- Wishlist management
- Server-side price validation
- Stock validation
- Payment gateway integration
- Razorpay order creation
- Payment signature verification
- Error handling

---

# 🔒 Security Considerations

The application follows several security practices:

### Password Security

Passwords are hashed using:

```text
bcrypt
```

Passwords are never stored as plain text.

### JWT Security

JWT authentication is handled through an HttpOnly cookie.

### Environment Variables

Sensitive credentials such as:

```text
MONGO_URI
JWT_SECRET
RAZORPAY_KEY_SECRET
```

are stored in `.env`.

### Payment Security

The Razorpay secret key remains on the backend.

Payment verification is performed server-side.

### CORS

The backend restricts requests to configured frontend origins using:

```env
FRONTEND_URLS=http://localhost:5173
```

---

# 🏗️ Build for Production

## Frontend

From:

```text
shopkart-frontend/
```

run:

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

To preview the production build:

```bash
npm run preview
```

---

# 🌐 Deployment

For deployment, configure the following environment variables on the hosting platform.

### Backend

```env
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URLS=https://your-frontend-domain.com
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

### Frontend

```env
VITE_API_URL=https://your-backend-domain.com
```

Do not expose:

```text
RAZORPAY_KEY_SECRET
JWT_SECRET
MONGO_URI
```

in the frontend.

---

# ⚠️ Common Problems

## MongoDB connection failed

Check:

```env
MONGO_URI
```

and make sure MongoDB is accessible.

---

## CORS error

Make sure the frontend URL matches:

```env
FRONTEND_URLS
```

For local development:

```env
FRONTEND_URLS=http://localhost:5173
```

---

## Razorpay not opening

Check that:

```env
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

are configured correctly.

Also make sure the frontend can load the Razorpay Checkout script.

---

## Authentication not working

Make sure:

- Backend is running.
- Frontend is using the correct API URL.
- Cookies are enabled.
- CORS has `credentials: true`.
- Frontend requests use credentials where required.

---

# 📚 Lab Progression

ShopKart was developed incrementally through multiple engineering labs.

### Lab 01 — Authentication

Implemented:

- Registration
- Login
- Password hashing
- JWT
- HttpOnly cookies
- Protected profile
- Logout

### Lab 02 — Frontend Authentication

Implemented:

- React authentication UI
- Registration page
- Login page
- Home page
- API integration

### Lab 03 — Products

Implemented:

- Product API
- Product creation
- Product listing
- Product details
- Product deletion

### Lab 04 — Wishlist

Implemented:

- Add to wishlist
- View wishlist
- Remove from wishlist
- Protected wishlist APIs

### Lab 05 — Shopping Cart

Implemented:

- Add to cart
- View cart
- Update quantity
- Remove from cart
- Persistent backend cart
- React Cart Context

### Lab 06 — Checkout & Orders

Implemented:

- Checkout page
- Shipping address
- Order creation
- Stock validation
- Razorpay Test Mode
- Payment verification
- Order history
- Order details

---

# 👩‍💻 Author

**Eshika Kar**


---

# 📄 License

This project was developed for educational purposes.
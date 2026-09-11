# ShopEase — Full Stack E-Commerce Web Application

A complete, production-structured full stack e-commerce application. Users can register, log in,
browse and search products, filter by category/price, manage a shopping cart, and place orders.
Admins get a dedicated dashboard to manage products, orders, and users.

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication, bcrypt, express-validator, Helmet
**Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios, Context API (Auth + Cart)

## Project Structure

```
ecommerce-app/
├── backend/
│   ├── config/            # DB connection
│   ├── controllers/       # Route handlers (auth, product, cart, order, admin)
│   ├── middleware/        # auth, error handling, validation
│   ├── models/            # Mongoose schemas: User, Product, Cart, Order
│   ├── routes/             # Express routers
│   ├── seed/               # Database seed script
│   ├── utils/               # Token generation, query features (search/filter/sort/paginate)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, PrivateRoute, etc.
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/            # Home, Products, ProductDetail, Cart, Checkout, Orders...
│   │   │   └── admin/         # AdminDashboard, AdminProducts, AdminOrders, AdminUsers
│   │   ├── services/api.js   # Axios instance with interceptors
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Features

- **Authentication:** JWT-based register/login, password hashing (bcrypt), protected routes, role-based access (user/admin)
- **Product catalog:** search (MongoDB text index), category/price filters, sorting, pagination, product reviews/ratings
- **Cart:** persistent per-user cart stored server-side, quantity updates, stock validation
- **Orders:** checkout with shipping address & payment method, automatic tax/shipping calculation, stock deduction, order cancellation, order history
- **Admin workflow:** dashboard stats (revenue, orders by status, low stock alerts), full CRUD on products, order status management, user activation/deactivation
- **Validation & error handling:** express-validator on all inputs, centralized error middleware, consistent JSON error responses, frontend form validation and inline error messages
- **Responsive UI:** mobile-first Tailwind layout, responsive navbar with mobile menu, responsive product grid

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend Setup

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed               # optional: populates sample products + admin/user accounts
npm run dev                 # starts on http://localhost:5000
```

Demo accounts created by the seed script:
- Admin: `admin@example.com` / `admin123`
- Customer: `customer@example.com` / `customer123`

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # starts on http://localhost:5173
```

### 3. Docker (optional, runs everything together)

```bash
docker-compose up --build
```

## API Overview

| Method | Endpoint                         | Access         | Description                    |
|--------|-----------------------------------|----------------|---------------------------------|
| POST   | /api/auth/register                | Public         | Register a new user            |
| POST   | /api/auth/login                   | Public         | Log in                         |
| GET    | /api/auth/me                      | Private        | Get current user profile       |
| GET    | /api/products                     | Public         | List/search/filter products    |
| GET    | /api/products/:id                 | Public         | Get single product             |
| POST   | /api/products                     | Admin          | Create product                 |
| PUT    | /api/products/:id                 | Admin          | Update product                 |
| DELETE | /api/products/:id                 | Admin          | Remove product (soft delete)   |
| GET    | /api/cart                         | Private        | Get current user's cart        |
| POST   | /api/cart/items                   | Private        | Add item to cart               |
| PUT    | /api/cart/items/:productId        | Private        | Update item quantity           |
| DELETE | /api/cart/items/:productId        | Private        | Remove item from cart          |
| POST   | /api/orders                       | Private        | Place an order (from cart)     |
| GET    | /api/orders/my-orders             | Private        | List logged-in user's orders   |
| PUT    | /api/orders/:id/cancel             | Private        | Cancel a pending/processing order |
| GET    | /api/admin/stats                  | Admin          | Dashboard summary stats        |
| GET    | /api/admin/orders                 | Admin          | List all orders                |
| PUT    | /api/admin/orders/:id/status      | Admin          | Update order status            |
| GET    | /api/admin/users                  | Admin          | List all users                 |

## Notes for Deployment

- Set a strong, random `JWT_SECRET` in production.
- Update `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) to your deployed domains.
- Consider adding a real image upload service (e.g. Cloudinary/S3) — the current implementation accepts image URLs directly.
- Add a payment gateway integration (Stripe/Razorpay/PayPal SDK) to replace the simulated payment methods for production use.

# 📦 Product Inventory — Full-Stack REST API

> A production-grade, full-stack inventory management application with **Express REST API**, **React UI**, **JWT Authentication**, **SQLite database**, **Swagger docs**, **Postman collection**, **Docker support**, and **automated tests**.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-17%20passed-10b981)

---

## ✨ Features

- **REST API** — 8 endpoints with proper HTTP methods and status codes
- **JWT Authentication** — Signup, Login, Logout with bcrypt password hashing
- **Protected Endpoints** — Create, Update, Delete require valid JWT; Read is public
- **React Frontend** — Modern dark-mode dashboard with full CRUD, search, filtering
- **Zod Validation** — Schema-based request validation with field-level error messages
- **SQLite Database** — Zero-config local database, auto-migrates tables and seeds sample data on startup
- **Swagger UI** — Interactive OpenAPI 3.0 documentation at `/api-docs`
- **Postman Collection** — Pre-built collection ready for import
- **Docker** — One-command startup with `docker compose up`
- **Automated Tests** — 17 Jest + Supertest integration tests covering auth, public, and protected flows

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended, one command)

```bash
docker compose up --build
```

Open `http://localhost:3000` — everything is running.

### Option 2 — Run Locally

**Prerequisites:** Node.js 18+ and npm

```bash
# 1. Clone the repo
git clone https://github.com/sidharth0224/week1.git
cd week1

# 2. Install backend dependencies
npm install

# 3. Install and build frontend
cd client && npm install && npm run build && cd ..

# 4. Start the server
npm start
```

Open `http://localhost:3000` — the React UI is served from the Express server.

### Option 3 — Development Mode (hot reload)

```bash
# Terminal 1: Backend with auto-restart
npm run dev

# Terminal 2: Frontend with hot module replacement
cd client && npm run dev
```

- Backend API: `http://localhost:3000`
- Frontend dev server: `http://localhost:5173` (proxies `/api` to backend)

---

## 🔗 Available URLs

| URL | Description |
|:---|:---|
| `http://localhost:3000/` | React Frontend Dashboard |
| `http://localhost:3000/api-docs` | Swagger Interactive API Docs |
| `http://localhost:3000/api/v1/products` | Products JSON Endpoint |
| `http://localhost:3000/api/v1/auth/login` | Auth Login Endpoint |

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Passwords are hashed with **bcrypt**.

### Default Admin Account
```
Email:    admin@example.com
Password: admin123
```

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `POST` | `/api/v1/auth/signup` | Create new account | Public |
| `POST` | `/api/v1/auth/login` | Login, get JWT token | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile | 🔒 Token |

### How It Works
1. Call `/api/v1/auth/login` with email and password → receive a JWT token
2. Include the token in subsequent requests: `Authorization: Bearer <token>`
3. Protected endpoints reject requests without a valid token with `401 Unauthorized`

---

## 📋 API Endpoints

### Products (CRUD)

| Method | Endpoint | Description | Auth | Status Codes |
|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/products` | List all products (paginated, filterable, searchable) | Public | `200` |
| `GET` | `/api/v1/products/:id` | Get single product by ID | Public | `200`, `404` |
| `POST` | `/api/v1/products` | Create new product | 🔒 Token | `201`, `400`, `401`, `409` |
| `PUT` | `/api/v1/products/:id` | Full update of product | 🔒 Token | `200`, `400`, `401`, `404` |
| `PATCH` | `/api/v1/products/:id` | Partial update (price, stock, etc.) | 🔒 Token | `200`, `400`, `401`, `404` |
| `DELETE` | `/api/v1/products/:id` | Delete a product | 🔒 Token | `200`, `401`, `404` |

### Analytics & System

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `GET` | `/api/v1/products/stats` | Inventory analytics (totals, categories) | Public |
| `POST` | `/api/v1/products/seed` | Reset DB & re-seed sample data | 🔒 Token |

### Query Parameters for `GET /api/v1/products`

| Parameter | Example | Description |
|:---|:---|:---|
| `search` | `?search=headphones` | Search name, SKU, or description |
| `category` | `?category=Electronics` | Filter by category |
| `status` | `?status=in_stock` | Filter: `in_stock`, `low_stock`, `out_of_stock` |
| `minPrice` | `?minPrice=50` | Minimum price filter |
| `maxPrice` | `?maxPrice=200` | Maximum price filter |
| `sortBy` | `?sortBy=price` | Sort column: `name`, `price`, `stock`, `created_at` |
| `order` | `?order=ASC` | Sort direction: `ASC` or `DESC` |
| `page` | `?page=2` | Page number (default: 1) |
| `limit` | `?limit=20` | Items per page (default: 10, max: 100) |

---

## 📄 Example API Usage

### Create a Product (requires auth)
```bash
# Login first
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use the returned token
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Wireless Mouse",
    "sku": "MOUSE-001",
    "category": "Electronics",
    "price": 29.99,
    "stock": 50,
    "description": "Ergonomic wireless mouse"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 6,
    "name": "Wireless Mouse",
    "sku": "MOUSE-001",
    "category": "Electronics",
    "price": 29.99,
    "stock": 50,
    "description": "Ergonomic wireless mouse",
    "status": "in_stock",
    "created_at": "2026-09-16 12:00:00",
    "updated_at": "2026-09-16 12:00:00"
  }
}
```

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body parameter(s)",
    "details": [
      { "field": "price", "message": "Price must be greater than 0" },
      { "field": "sku", "message": "SKU is required" }
    ]
  }
}
```

---

## 🧪 Running Tests

```bash
npm test
```

**17 tests** covering:
- Auth flow (signup, login, duplicate email, wrong password, token validation)
- Public endpoints (list, get by ID, stats)
- Protected endpoint rejection (401 without token)
- Protected endpoint success (CRUD with valid token)

```
PASS tests/product.test.js
  Auth Endpoints
    ✓ POST /api/v1/auth/signup → 201 Created
    ✓ POST /api/v1/auth/signup → 409 Conflict for duplicate email
    ✓ POST /api/v1/auth/login → 200 OK with valid credentials
    ✓ POST /api/v1/auth/login → 401 Unauthorized with wrong password
    ✓ GET /api/v1/auth/me → 200 OK with valid token
    ✓ GET /api/v1/auth/me → 401 Unauthorized without token
  Public Endpoints
    ✓ GET /api/v1/products → 200 OK (public)
    ✓ GET /api/v1/products/1 → 200 OK (public)
    ✓ GET /api/v1/products/stats → 200 OK (public)
  Protected Endpoints → 401 without token
    ✓ POST /api/v1/products → 401 Unauthorized
    ✓ PUT /api/v1/products/1 → 401 Unauthorized
    ✓ PATCH /api/v1/products/1 → 401 Unauthorized
    ✓ DELETE /api/v1/products/1 → 401 Unauthorized
  Protected Endpoints → Success with valid JWT
    ✓ POST /api/v1/products → 201 Created with token
    ✓ PUT /api/v1/products/:id → 200 OK with token
    ✓ PATCH /api/v1/products/:id → 200 OK with token
    ✓ DELETE /api/v1/products/:id → 200 OK with token

Tests: 17 passed, 17 total
```

---

## 📮 Postman Collection

Import the pre-built collection for quick testing:

```
postman/Product_Inventory_API.postman_collection.json
```

Open Postman → Import → select the file. All 8 requests are pre-configured with body templates.

---

## 🗄️ Database Schema

SQLite database (`inventory.db`) is auto-created on first startup.

### `products` table
```sql
CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  sku         TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL,
  price       REAL NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  status      TEXT DEFAULT 'in_stock',   -- in_stock | low_stock | out_of_stock | discontinued
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `users` table
```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   └── database.js            # SQLite connection, migrations, seeding
│   ├── controllers/
│   │   ├── authController.js      # Signup, Login, GetMe handlers
│   │   └── productController.js   # CRUD + stats + seed handlers
│   ├── docs/
│   │   └── swagger.js             # OpenAPI 3.0 specification
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token verification
│   │   ├── errorHandler.js        # Global error handler + 404
│   │   └── validateProduct.js     # Zod schema validation
│   ├── models/
│   │   ├── productModel.js        # Product SQL queries (DAO)
│   │   └── userModel.js           # User SQL queries + bcrypt
│   ├── routes/
│   │   ├── authRoutes.js          # /api/v1/auth/*
│   │   └── productRoutes.js       # /api/v1/products/*
│   ├── app.js                     # Express app configuration
│   └── server.js                  # HTTP server entry point
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx      # Login/Signup modal
│   │   │   ├── FilterBar.jsx      # Search + filter controls
│   │   │   ├── Navbar.jsx         # Header with auth state
│   │   │   ├── ProductModal.jsx   # Create/Edit product form
│   │   │   ├── ProductTable.jsx   # Data table with actions
│   │   │   ├── StatsCards.jsx     # KPI metric cards
│   │   │   └── Toast.jsx          # Notification alerts
│   │   ├── services/
│   │   │   └── api.js             # Centralized API + Auth service
│   │   ├── App.jsx                # Main app with state management
│   │   ├── index.css              # Design system + styling
│   │   └── main.jsx               # React entry point
│   ├── dist/                      # Production build output
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── public/
│   └── index.html                 # Fallback vanilla HTML dashboard
├── postman/
│   └── Product_Inventory_API.postman_collection.json
├── tests/
│   └── product.test.js            # 17 Jest integration tests
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Runtime** | Node.js 22 |
| **Backend** | Express.js 4 |
| **Database** | SQLite 3 (via `sqlite` / `sqlite3`) |
| **Auth** | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| **Validation** | Zod |
| **API Docs** | Swagger UI + swagger-jsdoc (OpenAPI 3.0) |
| **Frontend** | React 18 + Vite |
| **Icons** | Lucide React |
| **Testing** | Jest + Supertest |
| **Security** | Helmet, CORS |
| **Containerization** | Docker + Docker Compose |

---

## 📝 Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
PORT=3000              # Server port
NODE_ENV=development   # Environment (development | production | test)
DB_FILE=inventory.db   # SQLite database file path
JWT_SECRET=your-secret # JWT signing secret (change in production!)
```

---

## 📜 License

ISC

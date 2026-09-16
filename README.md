# 📦 Product Inventory REST API

A production-grade, fully-featured REST API with complete CRUD operations (Create, Read, Update, Delete), SQL database storage, interactive Swagger documentation, Zod input validation, automated Jest integration tests, Postman collection, and a built-in visual web dashboard.

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (`sqlite3` & `sqlite` promise wrapper)
- **Validation**: Zod
- **Documentation**: Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **Testing**: Jest & Supertest
- **Security & Logging**: Helmet, CORS, Morgan

---

## 🛠️ Features

- ✅ **5 Core CRUD Endpoints + Analytics & Seeding**
- ✅ **Local SQLite Database** (Auto-creates `inventory.db` & populates sample dataset on boot)
- ✅ **Structured JSON Responses** with standardized HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Server Error`)
- ✅ **Zod Request Validation** with field-level error messages
- ✅ **Interactive Swagger OpenAPI UI** at `/api-docs`
- ✅ **Interactive Web Visualizer Dashboard** at `/`
- ✅ **Exported Postman Collection** included in `./postman/`
- ✅ **Automated Integration Test Suite** using Jest & Supertest

---

## 📋 Endpoints Overview

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/products` | Retrieve list of products (supports query params: `category`, `status`, `search`, `minPrice`, `maxPrice`, `sortBy`, `order`, `page`, `limit`) | `200 OK` |
| **GET** | `/api/v1/products/:id` | Get details of a single product by numeric ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **POST** | `/api/v1/products` | Create a new product | `201 Created`, `400 Bad Request`, `409 Conflict` |
| **PUT** | `/api/v1/products/:id` | Full update of an existing product | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| **PATCH** | `/api/v1/products/:id` | Partial update of product fields (e.g. price, stock, status) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/v1/products/:id` | Delete a product by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **GET** | `/api/v1/products/stats` | Aggregate inventory metrics (total items, total valuation, category breakdown) | `200 OK` |
| **POST** | `/api/v1/products/seed` | Reset database and re-seed sample product inventory | `200 OK` |

---

## 💻 Quick Start & Running Locally

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run Development Server
Start the Express server with live reload:
```bash
npm run dev
```
Or start in production mode:
```bash
npm start
```

### 3. Access Interfaces
- **Web Visual Dashboard**: `http://localhost:3000/`
- **Swagger OpenAPI Docs**: `http://localhost:3000/api-docs`
- **API Root Endpoint**: `http://localhost:3000/api/v1/products`

---

## 🧪 Running Automated Tests

Run the full integration test suite using Jest:
```bash
npm test
```

---

## 📮 Postman Collection

A pre-configured Postman Collection is ready for instant import:
- File location: `./postman/Product_Inventory_API.postman_collection.json`
- Open Postman or Thunder Client -> Click **Import** -> Select `Product_Inventory_API.postman_collection.json`.

---

## 📄 Example Requests & Responses

### 1. Create Product (`POST /api/v1/products`)
**Request Body**:
```json
{
  "name": "Smart Fitness Watch v2",
  "sku": "SMART-9001",
  "category": "Electronics",
  "price": 149.99,
  "stock": 35,
  "description": "Waterproof smartwatch with heart rate monitoring and GPS tracking.",
  "status": "in_stock"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 6,
    "name": "Smart Fitness Watch v2",
    "sku": "SMART-9001",
    "category": "Electronics",
    "price": 149.99,
    "stock": 35,
    "description": "Waterproof smartwatch with heart rate monitoring and GPS tracking.",
    "status": "in_stock",
    "created_at": "2026-09-16 11:30:00",
    "updated_at": "2026-09-16 11:30:00"
  }
}
```

### 2. Validation Error (`400 Bad Request`)
If invalid or missing data is sent:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body parameter(s)",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      },
      {
        "field": "sku",
        "message": "SKU is required"
      }
    ]
  }
}
```

---

## 🗄️ Database Schema (`products`)

```sql
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'in_stock',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📁 Project Structure

```
Week1/
├── src/
│   ├── config/
│   │   └── database.js          # SQLite connection and migration/initialization
│   ├── controllers/
│   │   └── productController.js # Route handlers and HTTP logic
│   ├── docs/
│   │   └── swagger.js           # OpenAPI / Swagger configuration
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error and 404 middlewares
│   │   └── validateProduct.js   # Zod request validation middleware
│   ├── models/
│   │   └── productModel.js      # SQL Data Access Layer
│   ├── routes/
│   │   └── productRoutes.js     # Express router endpoints
│   ├── app.js                   # Express application configuration
│   └── server.js                # HTTP server launcher
├── public/
│   └── index.html               # Interactive visual Web Dashboard
├── postman/
│   └── Product_Inventory_API.postman_collection.json # Postman Collection
├── tests/
│   └── product.test.js          # Jest & Supertest integration tests
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

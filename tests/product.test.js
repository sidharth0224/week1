const request = require('supertest');
const app = require('../src/app');
const { initDatabase, getDatabase } = require('../src/config/database');

describe('Product Inventory REST API Integration Tests', () => {
  beforeAll(async () => {
    // Initialize in-memory database for testing
    await initDatabase(':memory:');
  });

  afterAll(async () => {
    const db = getDatabase();
    await db.close();
  });

  describe('GET /api/v1/products', () => {
    it('should return a list of initial seeded products with 200 OK', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toHaveProperty('totalItems');
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/v1/products?category=Electronics');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach(item => {
        expect(item.category.toLowerCase()).toBe('electronics');
      });
    });

    it('should search products by search query keyword', async () => {
      const res = await request(app).get('/api/v1/products?search=Headphones');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a product by valid ID with 200 OK', async () => {
      const res = await request(app).get('/api/v1/products/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toEqual(1);
    });

    it('should return 404 Not Found for non-existent product ID', async () => {
      const res = await request(app).get('/api/v1/products/9999');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('NOT_FOUND');
    });

    it('should return 400 Bad Request for invalid non-numeric ID', async () => {
      const res = await request(app).get('/api/v1/products/abc');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('INVALID_ID');
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product and return 201 Created', async () => {
      const newProduct = {
        name: 'Wireless Ergonomic Keyboard',
        sku: 'PERIPH-7777',
        category: 'Electronics',
        price: 89.99,
        stock: 25,
        description: 'Split ergonomic keyboard with Bluetooth.'
      };

      const res = await request(app)
        .post('/api/v1/products')
        .send(newProduct);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toEqual(newProduct.name);
      expect(res.body.data.sku).toEqual(newProduct.sku);
      expect(res.body.data.status).toEqual('in_stock');
    });

    it('should return 400 Bad Request if required fields are missing', async () => {
      const invalidProduct = {
        name: 'Incomplete Item'
        // missing sku, category, price, stock
      };

      const res = await request(app)
        .post('/api/v1/products')
        .send(invalidProduct);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('VALIDATION_ERROR');
    });

    it('should return 409 Conflict when creating a product with duplicate SKU', async () => {
      const duplicateProduct = {
        name: 'Duplicate SKU Product',
        sku: 'AUDIO-1001', // SKU already exists from seed
        category: 'Electronics',
        price: 50.00,
        stock: 10
      };

      const res = await request(app)
        .post('/api/v1/products')
        .send(duplicateProduct);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('DUPLICATE_SKU');
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update an existing product with 200 OK', async () => {
      const updateData = {
        name: 'Updated Noise-Canceling Headphones',
        sku: 'AUDIO-1001',
        category: 'Electronics',
        price: 219.99,
        stock: 50,
        description: 'Updated premium description.',
        status: 'in_stock'
      };

      const res = await request(app)
        .put('/api/v1/products/1')
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual(updateData.name);
      expect(res.body.data.price).toEqual(updateData.price);
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('should partially update product stock/price with 200 OK', async () => {
      const patchData = {
        price: 199.99,
        stock: 40
      };

      const res = await request(app)
        .patch('/api/v1/products/1')
        .send(patchData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toEqual(199.99);
      expect(res.body.data.stock).toEqual(40);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product with 200 OK', async () => {
      const res = await request(app).delete('/api/v1/products/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toEqual(1);

      // Verify it no longer exists
      const checkRes = await request(app).get('/api/v1/products/1');
      expect(checkRes.statusCode).toEqual(404);
    });
  });

  describe('GET /api/v1/products/stats', () => {
    it('should return aggregate inventory analytics', async () => {
      const res = await request(app).get('/api/v1/products/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalProducts');
      expect(res.body.data).toHaveProperty('totalStockQuantity');
      expect(res.body.data).toHaveProperty('totalInventoryValue');
    });
  });
});

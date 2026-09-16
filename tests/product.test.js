const request = require('supertest');
const app = require('../src/app');
const { initDatabase, getDatabase } = require('../src/config/database');

let authToken = null;

describe('Product Inventory REST API Integration Tests (with Auth)', () => {
  beforeAll(async () => {
    await initDatabase(':memory:');

    // Register a test user and get JWT token
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send({ username: 'Test User', email: 'test@test.com', password: 'password123' });

    authToken = signupRes.body.data.token;
  });

  afterAll(async () => {
    const db = getDatabase();
    await db.close();
  });

  // ── Auth Endpoint Tests ──
  describe('Auth Endpoints', () => {
    it('POST /api/v1/auth/signup → 201 Created', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ username: 'New User', email: 'new@test.com', password: 'secret123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('id');
    });

    it('POST /api/v1/auth/signup → 409 Conflict for duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ username: 'Dup User', email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login → 200 OK with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('POST /api/v1/auth/login → 401 Unauthorized with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpass' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me → 200 OK with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('email', 'test@test.com');
    });

    it('GET /api/v1/auth/me → 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Public Endpoints (no auth required) ──
  describe('Public Endpoints', () => {
    it('GET /api/v1/products → 200 OK (public)', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/products/1 → 200 OK (public)', async () => {
      const res = await request(app).get('/api/v1/products/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/products/stats → 200 OK (public)', async () => {
      const res = await request(app).get('/api/v1/products/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('totalProducts');
    });
  });

  // ── Protected Endpoints: Reject without token (401) ──
  describe('Protected Endpoints → 401 without token', () => {
    it('POST /api/v1/products → 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Test', sku: 'TST-001', category: 'Test', price: 10, stock: 5 });

      expect(res.statusCode).toEqual(401);
    });

    it('PUT /api/v1/products/1 → 401 Unauthorized', async () => {
      const res = await request(app)
        .put('/api/v1/products/1')
        .send({ name: 'Test', sku: 'AUDIO-1001', category: 'Test', price: 10, stock: 5 });

      expect(res.statusCode).toEqual(401);
    });

    it('PATCH /api/v1/products/1 → 401 Unauthorized', async () => {
      const res = await request(app)
        .patch('/api/v1/products/1')
        .send({ price: 999 });

      expect(res.statusCode).toEqual(401);
    });

    it('DELETE /api/v1/products/1 → 401 Unauthorized', async () => {
      const res = await request(app).delete('/api/v1/products/1');

      expect(res.statusCode).toEqual(401);
    });
  });

  // ── Protected Endpoints: Success with valid token ──
  describe('Protected Endpoints → Success with valid JWT', () => {
    it('POST /api/v1/products → 201 Created with token', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Auth Test Product',
          sku: 'AUTH-9999',
          category: 'Testing',
          price: 42.00,
          stock: 10,
          description: 'Created with JWT auth'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual('Auth Test Product');
    });

    it('PUT /api/v1/products/:id → 200 OK with token', async () => {
      const res = await request(app)
        .put('/api/v1/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Headphones',
          sku: 'AUDIO-1001',
          category: 'Electronics',
          price: 250.00,
          stock: 60,
          description: 'Updated via auth'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.price).toEqual(250);
    });

    it('PATCH /api/v1/products/:id → 200 OK with token', async () => {
      const res = await request(app)
        .patch('/api/v1/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stock: 99 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.stock).toEqual(99);
    });

    it('DELETE /api/v1/products/:id → 200 OK with token', async () => {
      const res = await request(app)
        .delete('/api/v1/products/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify deleted
      const check = await request(app).get('/api/v1/products/1');
      expect(check.statusCode).toEqual(404);
    });
  });
});

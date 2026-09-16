const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Inventory REST API',
      version: '1.0.0',
      description: 'Production-grade RESTful API with full CRUD operations for managing product inventory, built with Node.js, Express, and SQLite.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Wireless Noise-Canceling Headphones' },
            sku: { type: 'string', example: 'AUDIO-1001' },
            category: { type: 'string', example: 'Electronics' },
            price: { type: 'number', format: 'float', example: 199.99 },
            stock: { type: 'integer', example: 45 },
            description: { type: 'string', example: 'Premium over-ear headphones with active noise cancellation' },
            status: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], example: 'in_stock' },
            created_at: { type: 'string', format: 'date-time', example: '2026-09-16 11:30:00' },
            updated_at: { type: 'string', format: 'date-time', example: '2026-09-16 11:30:00' }
          }
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'sku', 'category', 'price', 'stock'],
          properties: {
            name: { type: 'string', example: 'Wireless Ergonomic Mouse' },
            sku: { type: 'string', example: 'PERIPH-3005' },
            category: { type: 'string', example: 'Electronics' },
            price: { type: 'number', example: 49.99 },
            stock: { type: 'integer', example: 30 },
            description: { type: 'string', example: 'Ultra-fast precision wireless mouse' },
            status: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], example: 'in_stock' }
          }
        },
        ProductPatchInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Wireless Ergonomic Mouse v2' },
            price: { type: 'number', example: 45.00 },
            stock: { type: 'integer', example: 25 },
            status: { type: 'string', example: 'in_stock' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid request body parameter(s)' },
                details: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/v1/products': {
        get: {
          summary: 'Retrieve all products (with pagination, filter, search, sort)',
          tags: ['Products'],
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category (e.g. Electronics)' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'] } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name, SKU, or description' },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'created_at' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            '200': {
              description: 'Successful retrieval of product list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Products retrieved successfully' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      pagination: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new product',
          tags: ['Products'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductInput' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Product created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Product created successfully' },
                      data: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '409': { description: 'Conflict - Duplicate SKU', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/v1/products/{id}': {
        get: {
          summary: 'Get a product by ID',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Product details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Product' } } } } } },
            '404': { description: 'Product not found' }
          }
        },
        put: {
          summary: 'Full update of product by ID',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
          responses: {
            '200': { description: 'Product updated successfully' },
            '400': { description: 'Validation Error' },
            '404': { description: 'Product not found' }
          }
        },
        patch: {
          summary: 'Partial update of product by ID',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductPatchInput' } } } },
          responses: {
            '200': { description: 'Product updated partially' },
            '400': { description: 'Validation Error' },
            '404': { description: 'Product not found' }
          }
        },
        delete: {
          summary: 'Delete product by ID',
          tags: ['Products'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Product deleted successfully' },
            '404': { description: 'Product not found' }
          }
        }
      },
      '/api/v1/products/stats': {
        get: {
          summary: 'Get aggregate inventory metrics & analytics',
          tags: ['Analytics'],
          responses: {
            '200': { description: 'Inventory analytics data' }
          }
        }
      },
      '/api/v1/products/seed': {
        post: {
          summary: 'Reset database and seed sample products',
          tags: ['System'],
          responses: {
            '200': { description: 'Sample dataset seeded' }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

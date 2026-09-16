const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security Middlewares (configured to allow inline scripts for Swagger UI & Dashboard)
app.use(helmet({
  contentSecurityPolicy: false
}));

// Enable CORS & JSON Request Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger in non-test env
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Static Files (Vite Client Build UI & Public Dashboard)
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}
app.use(express.static(path.join(__dirname, '../public')));

// Swagger API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Product Inventory API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

// Root Route - Redirect or information response
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Product Inventory REST API v1',
    documentation: '/api-docs',
    endpoints: {
      products: '/api/v1/products',
      stats: '/api/v1/products/stats',
      seed: '/api/v1/products/seed'
    }
  });
});

// 404 & Global Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

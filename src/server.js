require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize SQLite database table schema and seed data
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`
🚀 Product Inventory REST API Server running on port ${PORT}
📦 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Dashboard UI:      http://localhost:${PORT}/
📚 Swagger API Docs: http://localhost:${PORT}/api-docs
🎯 Products Endpoint: http://localhost:${PORT}/api/v1/products
      `);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Closing HTTP server gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

/**
 * Initialize SQLite database connection and create tables if not exists.
 * @param {string} [customPath] Optional custom path (useful for testing, e.g. ':memory:')
 */
async function initDatabase(customPath) {
  const dbPath = customPath || process.env.DB_FILE || path.join(__dirname, '../../inventory.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign key constraints
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  // Create products table
  await dbInstance.exec(`
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
  `);

  // Seed sample products if table is empty
  const countResult = await dbInstance.get('SELECT COUNT(*) as count FROM products');
  if (countResult.count === 0) {
    await seedInitialData(dbInstance);
  }

  return dbInstance;
}

/**
 * Get current database instance.
 */
function getDatabase() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

/**
 * Seed initial sample products into database.
 */
async function seedInitialData(db) {
  const sampleProducts = [
    {
      name: 'Wireless Noise-Canceling Headphones',
      sku: 'AUDIO-1001',
      category: 'Electronics',
      price: 199.99,
      stock: 45,
      description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
      status: 'in_stock'
    },
    {
      name: 'Ergonomic Mechanical Keyboard',
      sku: 'PERIPH-2002',
      category: 'Electronics',
      price: 129.50,
      stock: 18,
      description: 'RGB mechanical keyboard with hot-swappable switches and split ergonomic layout.',
      status: 'in_stock'
    },
    {
      name: 'Organic Espresso Coffee Beans (1kg)',
      sku: 'GROC-3003',
      category: 'Groceries',
      price: 24.99,
      stock: 120,
      description: 'Dark roast whole coffee beans sourced from high-altitude fair-trade farms.',
      status: 'in_stock'
    },
    {
      name: 'Ultra-Wide Curved Gaming Monitor 34"',
      sku: 'DISP-4004',
      category: 'Electronics',
      price: 549.00,
      stock: 5,
      description: '144Hz WQHD curved gaming display with HDR400 support.',
      status: 'low_stock'
    },
    {
      name: 'Stainless Steel Insulated Water Bottle (750ml)',
      sku: 'OUTDOOR-5005',
      category: 'Home & Kitchen',
      price: 18.00,
      stock: 0,
      description: 'Double-wall vacuum insulated flask keeping drinks cold for 24 hours.',
      status: 'out_of_stock'
    }
  ];

  const stmt = await db.prepare(`
    INSERT INTO products (name, sku, category, price, stock, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of sampleProducts) {
    await stmt.run(item.name, item.sku, item.category, item.price, item.stock, item.description, item.status);
  }

  await stmt.finalize();
  console.log('✅ SQLite database initialized and sample product data seeded.');
}

module.exports = {
  initDatabase,
  getDatabase
};

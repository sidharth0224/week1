const { getDatabase } = require('../config/database');

class ProductModel {
  /**
   * Find products with filtering, search, sorting, and pagination.
   */
  static async findAll(options = {}) {
    const db = getDatabase();
    const {
      category,
      status,
      search,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 10
    } = options;

    let whereClause = [];
    let params = [];

    if (category) {
      whereClause.push('LOWER(category) = LOWER(?)');
      params.push(category);
    }

    if (status) {
      whereClause.push('status = ?');
      params.push(status);
    }

    if (search) {
      whereClause.push('(LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(description) LIKE ?)');
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      whereClause.push('price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      whereClause.push('price <= ?');
      params.push(Number(maxPrice));
    }

    const whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    // Count total matching items
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereString}`;
    const countResult = await db.get(countQuery, params);
    const totalItems = countResult.total;

    // Validate sort column to avoid SQL injection
    const allowedSortColumns = ['id', 'name', 'price', 'stock', 'category', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Query products
    const query = `
      SELECT * FROM products
      ${whereString}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const products = await db.all(query, [...params, limitNum, offset]);

    return {
      data: products,
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        limit: limitNum
      }
    };
  }

  /**
   * Find a single product by ID.
   */
  static async findById(id) {
    const db = getDatabase();
    return await db.get('SELECT * FROM products WHERE id = ?', [id]);
  }

  /**
   * Find a single product by SKU.
   */
  static async findBySku(sku) {
    const db = getDatabase();
    return await db.get('SELECT * FROM products WHERE sku = ?', [sku]);
  }

  /**
   * Create a new product.
   */
  static async create(data) {
    const db = getDatabase();
    const { name, sku, category, price, stock, description = '', status } = data;

    // Determine default status based on stock if not provided
    let calculatedStatus = status;
    if (!calculatedStatus) {
      if (stock === 0) calculatedStatus = 'out_of_stock';
      else if (stock <= 5) calculatedStatus = 'low_stock';
      else calculatedStatus = 'in_stock';
    }

    const result = await db.run(
      `INSERT INTO products (name, sku, category, price, stock, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, sku.toUpperCase(), category, price, stock, description, calculatedStatus]
    );

    return await this.findById(result.lastID);
  }

  /**
   * Full update of a product by ID.
   */
  static async update(id, data) {
    const db = getDatabase();
    const { name, sku, category, price, stock, description = '', status } = data;

    let calculatedStatus = status;
    if (!calculatedStatus) {
      if (stock === 0) calculatedStatus = 'out_of_stock';
      else if (stock <= 5) calculatedStatus = 'low_stock';
      else calculatedStatus = 'in_stock';
    }

    const result = await db.run(
      `UPDATE products
       SET name = ?, sku = ?, category = ?, price = ?, stock = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, sku.toUpperCase(), category, price, stock, description, calculatedStatus, id]
    );

    if (result.changes === 0) return null;
    return await this.findById(id);
  }

  /**
   * Partial update (PATCH) of a product by ID.
   */
  static async patch(id, data) {
    const db = getDatabase();
    const existing = await this.findById(id);
    if (!existing) return null;

    const fields = [];
    const params = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.sku !== undefined) {
      fields.push('sku = ?');
      params.push(data.sku.toUpperCase());
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      params.push(data.category);
    }
    if (data.price !== undefined) {
      fields.push('price = ?');
      params.push(data.price);
    }
    if (data.stock !== undefined) {
      fields.push('stock = ?');
      params.push(data.stock);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    } else if (data.stock !== undefined) {
      // auto update status if stock changed and status was not explicitly supplied
      let autoStatus = existing.status;
      if (data.stock === 0) autoStatus = 'out_of_stock';
      else if (data.stock <= 5) autoStatus = 'low_stock';
      else if (existing.status === 'out_of_stock' || existing.status === 'low_stock') autoStatus = 'in_stock';
      fields.push('status = ?');
      params.push(autoStatus);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    params.push(id);

    await db.run(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return await this.findById(id);
  }

  /**
   * Delete a product by ID.
   */
  static async delete(id) {
    const db = getDatabase();
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Get aggregate statistics for products inventory.
   */
  static async getStats() {
    const db = getDatabase();

    const totals = await db.get(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(stock) as totalStockQuantity,
        SUM(price * stock) as totalInventoryValue,
        AVG(price) as averagePrice
      FROM products
    `);

    const categories = await db.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY count DESC
    `);

    const statusCounts = await db.all(`
      SELECT status, COUNT(*) as count 
      FROM products 
      GROUP BY status
    `);

    return {
      totalProducts: totals.totalProducts || 0,
      totalStockQuantity: totals.totalStockQuantity || 0,
      totalInventoryValue: Math.round((totals.totalInventoryValue || 0) * 100) / 100,
      averagePrice: Math.round((totals.averagePrice || 0) * 100) / 100,
      byCategory: categories,
      byStatus: statusCounts
    };
  }

  /**
   * Reset database table and re-seed initial data.
   */
  static async resetAndSeed() {
    const db = getDatabase();
    await db.exec('DELETE FROM products;');
    await db.exec('DELETE FROM sqlite_sequence WHERE name="products";');
    const { initDatabase } = require('../config/database');
    const { seedInitialData } = require('../config/database');
  }
}

module.exports = ProductModel;

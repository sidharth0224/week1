const ProductModel = require('../models/productModel');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/products
 * Retrieve products with optional query parameters: category, status, search, minPrice, maxPrice, sortBy, order, page, limit
 */
async function getAllProducts(req, res, next) {
  try {
    const result = await ProductModel.findAll(req.query);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/products/stats
 * Retrieve aggregate analytics for products inventory
 */
async function getProductStats(req, res, next) {
  try {
    const stats = await ProductModel.getStats();
    res.status(200).json({
      success: true,
      message: 'Inventory statistics retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/products/:id
 * Retrieve a single product by numeric ID
 */
async function getProductById(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID. ID must be an integer.', 'INVALID_ID');
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new ApiError(404, `Product with ID ${productId} was not found.`, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/products
 * Create a new product (Returns 201 Created)
 */
async function createProduct(req, res, next) {
  try {
    const productData = req.validatedBody;

    // Check if SKU already exists
    const existingSku = await ProductModel.findBySku(productData.sku);
    if (existingSku) {
      throw new ApiError(409, `A product with SKU '${productData.sku}' already exists.`, 'DUPLICATE_SKU');
    }

    const newProduct = await ProductModel.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/products/:id
 * Full update of an existing product (Returns 200 OK)
 */
async function updateProduct(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID. ID must be an integer.', 'INVALID_ID');
    }

    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      throw new ApiError(404, `Product with ID ${productId} was not found.`, 'NOT_FOUND');
    }

    const updateData = req.validatedBody;

    // Check if new SKU clashes with another product
    if (updateData.sku.toUpperCase() !== existingProduct.sku.toUpperCase()) {
      const existingSku = await ProductModel.findBySku(updateData.sku);
      if (existingSku) {
        throw new ApiError(409, `A product with SKU '${updateData.sku}' already exists.`, 'DUPLICATE_SKU');
      }
    }

    const updatedProduct = await ProductModel.update(productId, updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/products/:id
 * Partial update of an existing product (Returns 200 OK)
 */
async function patchProduct(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID. ID must be an integer.', 'INVALID_ID');
    }

    const patchData = req.validatedBody;
    if (Object.keys(patchData).length === 0) {
      throw new ApiError(400, 'At least one field must be provided for partial update.', 'EMPTY_PATCH');
    }

    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      throw new ApiError(404, `Product with ID ${productId} was not found.`, 'NOT_FOUND');
    }

    // SKU conflict check if modifying SKU
    if (patchData.sku && patchData.sku.toUpperCase() !== existingProduct.sku.toUpperCase()) {
      const existingSku = await ProductModel.findBySku(patchData.sku);
      if (existingSku) {
        throw new ApiError(409, `A product with SKU '${patchData.sku}' already exists.`, 'DUPLICATE_SKU');
      }
    }

    const updatedProduct = await ProductModel.patch(productId, patchData);

    res.status(200).json({
      success: true,
      message: 'Product updated partially',
      data: updatedProduct
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/products/:id
 * Delete a product by ID (Returns 200 OK with message & deleted item ID)
 */
async function deleteProduct(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID. ID must be an integer.', 'INVALID_ID');
    }

    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      throw new ApiError(404, `Product with ID ${productId} was not found.`, 'NOT_FOUND');
    }

    await ProductModel.delete(productId);

    res.status(200).json({
      success: true,
      message: `Product with ID ${productId} deleted successfully`,
      data: {
        id: productId,
        name: existingProduct.name,
        sku: existingProduct.sku
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/products/seed
 * Resets database and seeds fresh sample dataset
 */
async function seedProducts(req, res, next) {
  try {
    await ProductModel.resetAndSeed();
    const result = await ProductModel.findAll({ limit: 50 });
    res.status(200).json({
      success: true,
      message: 'Database reset and sample product inventory seeded successfully',
      data: result.data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductStats,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  seedProducts
};

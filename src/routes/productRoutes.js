const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validatePatchProduct
} = require('../middleware/validateProduct');

// Product stats endpoint (Public)
router.get('/stats', productController.getProductStats);

// Database re-seed endpoint (Protected)
router.post('/seed', authenticateToken, productController.seedProducts);

// Public List / Protected Create
router.route('/')
  .get(productController.getAllProducts)
  .post(authenticateToken, validateCreateProduct, productController.createProduct);

// Public Read / Protected Update & Delete
router.route('/:id')
  .get(productController.getProductById)
  .put(authenticateToken, validateUpdateProduct, productController.updateProduct)
  .patch(authenticateToken, validatePatchProduct, productController.patchProduct)
  .delete(authenticateToken, productController.deleteProduct);

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validatePatchProduct
} = require('../middleware/validateProduct');

// Product stats endpoint (placed before :id route to avoid route conflict)
router.get('/stats', productController.getProductStats);

// Database re-seed endpoint
router.post('/seed', productController.seedProducts);

// Standard CRUD Endpoints
router.route('/')
  .get(productController.getAllProducts)
  .post(validateCreateProduct, productController.createProduct);

router.route('/:id')
  .get(productController.getProductById)
  .put(validateUpdateProduct, productController.updateProduct)
  .patch(validatePatchProduct, productController.patchProduct)
  .delete(productController.deleteProduct);

module.exports = router;

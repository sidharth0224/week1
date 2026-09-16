const { z } = require('zod');

// Schema for Creating a Product (POST)
const createProductSchema = z.object({
  name: z.string({
    required_error: 'Product name is required',
    invalid_type_error: 'Product name must be a string'
  }).min(2, 'Product name must be at least 2 characters').max(100, 'Product name cannot exceed 100 characters'),

  sku: z.string({
    required_error: 'SKU is required',
    invalid_type_error: 'SKU must be a string'
  }).min(3, 'SKU must be at least 3 characters').regex(/^[A-Z0-9_-]+$/i, 'SKU can only contain alphanumeric characters, hyphens, and underscores'),

  category: z.string({
    required_error: 'Category is required',
    invalid_type_error: 'Category must be a string'
  }).min(2, 'Category must be at least 2 characters'),

  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number'
  }).positive('Price must be greater than 0'),

  stock: z.number({
    required_error: 'Stock is required',
    invalid_type_error: 'Stock must be a number'
  }).int('Stock must be an integer').nonnegative('Stock cannot be negative'),

  description: z.string().optional().default(''),

  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], {
    invalid_type_error: 'Status must be one of: in_stock, low_stock, out_of_stock, discontinued'
  }).optional()
});

// Schema for Full Update of a Product (PUT)
const updateProductSchema = createProductSchema;

// Schema for Partial Update of a Product (PATCH)
const patchProductSchema = createProductSchema.partial();

/**
 * Middleware factory to validate request body against a Zod schema.
 */
function validateRequestBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body parameter(s)',
          details: formattedErrors
        }
      });
    }

    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  validateCreateProduct: validateRequestBody(createProductSchema),
  validateUpdateProduct: validateRequestBody(updateProductSchema),
  validatePatchProduct: validateRequestBody(patchProductSchema)
};

/**
 * Custom API Error class for operational errors.
 */
class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Middleware for handling 404 Not Found routes.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
}

/**
 * Global Error Handler Middleware.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred on the server.';

  // Handle SQLite Unique Constraint Error (e.g. duplicate SKU)
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A product with this SKU already exists.',
        details: err.message
      }
    });
  }

  // Log 500 errors in development
  if (statusCode === 500) {
    console.error('🔥 Internal Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(err.details ? { details: err.details } : {})
    }
  });
}

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};

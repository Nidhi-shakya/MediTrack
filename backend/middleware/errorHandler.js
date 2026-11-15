// ==============================================================================
// MediTrack Centralized Error Handling Middleware
// [Requirement 3 & 5: Sanitized Errors & Prevention of Info Leakage]
// ==============================================================================

const errorHandler = (err, req, res, next) => {
  // Log error internally for debugging
  console.error('[Internal Error Handler]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid resource identifier format for '${err.path}'.`,
      code: 'INVALID_ID_FORMAT',
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists in the system.`,
      code: 'DUPLICATE_KEY_ERROR',
    });
  }

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Database schema validation failed.',
      errors,
      code: 'SCHEMA_VALIDATION_ERROR',
    });
  }

  // Generic sanitized 500 error (prevents leaking database/system internals)
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'An unexpected server error occurred. Please contact the clinic administrator.' : err.message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
  });
};

module.exports = errorHandler;

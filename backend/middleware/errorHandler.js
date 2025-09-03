/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // PostgreSQL/Supabase errors
  if (err.code === '23505') { // Unique violation
    const field = err.detail ? err.detail.match(/Key \((.+)\)=/)?.[1] : 'unknown';
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new AppError(message, 400);
  }

  if (err.code === '23503') { // Foreign key violation
    const message = 'Referenced record does not exist';
    error = new AppError(message, 400);
  }

  if (err.code === '23502') { // Not null violation
    const field = err.column || 'unknown';
    const message = `Field '${field}' is required`;
    error = new AppError(message, 400);
  }

  if (err.code === '22P02') { // Invalid text representation
    const message = 'Invalid ID format';
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = new AppError(message, 401);
  }

  // Supabase errors
  if (err.message && err.message.includes('JWT')) {
    const message = 'Invalid or expired token';
    error = new AppError(message, 401);
  }

  // Supabase auth errors
  if (err.message && err.message.includes('Invalid login credentials')) {
    const message = 'Invalid email or password';
    error = new AppError(message, 401);
  }

  if (err.message && err.message.includes('Email not confirmed')) {
    const message = 'Please confirm your email address before logging in';
    error = new AppError(message, 401);
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Development vs Production error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    error: true,
    message,
    statusCode,
    ...(isDevelopment && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  return (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    server.close(() => {
      console.log('Process terminated!');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  gracefulShutdown
};

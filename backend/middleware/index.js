/**
 * Middleware index file
 * Exports all middleware functions for easy importing
 */

// Authentication middleware
const { authenticateToken, optionalAuth, requireRole } = require('./auth');

// Validation middleware
const { validate, schemas, customValidators } = require('./validation');

// Error handling middleware
const { 
  AppError, 
  errorHandler, 
  notFound, 
  asyncHandler, 
  gracefulShutdown 
} = require('./errorHandler');

// Logging middleware
const { 
  requestLogger, 
  errorLogger, 
  performanceLogger, 
  securityLogger 
} = require('./logger');

// Rate limiting middleware
const {
  createRateLimiter,
  authRateLimiter,
  standardRateLimiter,
  strictRateLimiter,
  userRateLimiter,
  dynamicRateLimiter,
  burstRateLimiter
} = require('./rateLimiter');

// Export all middleware
module.exports = {
  // Authentication
  authenticateToken,
  optionalAuth,
  requireRole,
  
  // Validation
  validate,
  schemas,
  customValidators,
  
  // Error handling
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  gracefulShutdown,
  
  // Logging
  requestLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  
  // Rate limiting
  createRateLimiter,
  authRateLimiter,
  standardRateLimiter,
  strictRateLimiter,
  userRateLimiter,
  dynamicRateLimiter,
  burstRateLimiter
};

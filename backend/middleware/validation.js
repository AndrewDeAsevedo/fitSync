const Joi = require('joi');

/**
 * Generic validation middleware using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation failed',
        message: errorMessage,
        details: error.details
      });
    }

    // Replace the request property with validated data
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User validation schemas
  user: {
    create: Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required()
    }),
    
    update: Joi.object({
      username: Joi.string().min(3).max(30).optional(),
      email: Joi.string().email().optional()
    }),
    
    id: Joi.object({
      id: Joi.string().uuid().required()
    })
  },

  // Authentication validation schemas
  auth: {
    signup: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    }),
    
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },

  // Pagination and query schemas
  query: {
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('created_at', 'updated_at', 'username', 'email').default('created_at'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    
    search: Joi.object({
      q: Joi.string().min(1).max(100).optional(),
      filter: Joi.string().optional()
    })
  }
};

/**
 * Custom validation for specific fields
 */
const customValidators = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isStrongPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Validate UUID format
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};

module.exports = {
  validate,
  schemas,
  customValidators
};

/**
 * Rate limiting middleware to prevent API abuse
 */

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Custom error message
 * @param {boolean} options.skipSuccessfulRequests - Skip counting successful requests
 * @param {boolean} options.skipFailedRequests - Skip counting failed requests
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests per window default
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip, // Default key generator
    handler = (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit data for this key
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs,
        firstRequest: now
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Increment request count
    rateLimitData.count++;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - rateLimitData.count),
      'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
      'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000)
    });

    // Check if rate limit exceeded
    if (rateLimitData.count > max) {
      return handler(req, res);
    }

    // Store updated data
    rateLimitStore.set(key, rateLimitData);

    next();
  };
};

/**
 * Different rate limiters for different endpoints
 */

// Strict rate limiter for authentication endpoints
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req) => `auth:${req.ip}`,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Authentication rate limit exceeded',
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
      retryAfter: 900
    });
  }
});

// Standard rate limiter for general API endpoints
const standardRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.'
});

// Strict rate limiter for sensitive operations
const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many sensitive operations, please try again later.',
  keyGenerator: (req) => `strict:${req.ip}`
});

// Per-user rate limiter (requires authentication)
const userRateLimiter = (options = {}) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      if (!req.user || !req.user.id) {
        return `anonymous:${req.ip}`;
      }
      return `user:${req.user.id}`;
    }
  });
};

/**
 * Dynamic rate limiting based on user role
 */
const dynamicRateLimiter = (req, res, next) => {
  let maxRequests;
  let windowMs;

  if (req.user) {
    const userRole = req.user.user_metadata?.role || 'user';
    
    switch (userRole) {
      case 'admin':
        maxRequests = 1000;
        windowMs = 15 * 60 * 1000;
        break;
      case 'premium':
        maxRequests = 500;
        windowMs = 15 * 60 * 1000;
        break;
      case 'user':
      default:
        maxRequests = 100;
        windowMs = 15 * 60 * 1000;
        break;
    }
  } else {
    // Anonymous users get stricter limits
    maxRequests = 50;
    windowMs = 15 * 60 * 1000;
  }

  const limiter = createRateLimiter({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => req.user ? `dynamic:${req.user.id}` : `dynamic:${req.ip}`
  });

  limiter(req, res, next);
};

/**
 * Burst rate limiter for handling traffic spikes
 */
const burstRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests in a short time, please slow down.',
  keyGenerator: (req) => `burst:${req.ip}`
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  standardRateLimiter,
  strictRateLimiter,
  userRateLimiter,
  dynamicRateLimiter,
  burstRateLimiter
};

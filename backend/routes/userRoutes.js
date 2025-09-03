const express = require('express');
const router = express.Router();

// Import middleware
const {
  authenticateToken,
  optionalAuth,
  requireRole,
  validate,
  schemas,
  asyncHandler,
  authRateLimiter,
  standardRateLimiter
} = require('../middleware');

// Import controllers
const { 
  getAllUsersController, 
  createUserController, 
  getUserByIdController, 
  signup, 
  login 
} = require('../controllers/userController');

// Public routes (no authentication required)
router.post("/signup", 
  authRateLimiter, // Strict rate limiting for auth
  validate(schemas.auth.signup), 
  asyncHandler(signup)
);

router.post("/login", 
  authRateLimiter, // Strict rate limiting for auth
  validate(schemas.auth.login), 
  asyncHandler(login)
);

// Protected routes (authentication required)
router.get('/', 
  authenticateToken, // Require valid JWT token
  standardRateLimiter,
  asyncHandler(getAllUsersController)
);

router.post('/', 
  authenticateToken, // Require valid JWT token
  requireRole('admin'), // Only admins can create users
  standardRateLimiter,
  validate(schemas.user.create), 
  asyncHandler(createUserController)
);

router.get('/id/:id', 
  authenticateToken, // Require valid JWT token
  standardRateLimiter,
  validate(schemas.user.id, 'params'), // Validate URL parameters
  asyncHandler(getUserByIdController)
);

// Optional authentication route (works with or without auth)
router.get('/profile', 
  optionalAuth, // Optional authentication
  standardRateLimiter,
  asyncHandler(async (req, res) => {
    if (req.user) {
      res.json({ 
        user: req.user, 
        message: 'Profile retrieved successfully' 
      });
    } else {
      res.json({ 
        message: 'No authenticated user. Please log in for full profile access.' 
      });
    }
  })
);

// Admin-only route
router.get('/admin/users', 
  authenticateToken,
  requireRole('admin'), // Only admins can access
  standardRateLimiter,
  asyncHandler(async (req, res) => {
    // This would typically call a different controller method
    res.json({ message: 'Admin users endpoint - implement as needed' });
  })
);

module.exports = router;

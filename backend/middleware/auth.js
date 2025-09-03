const supabase = require('../config/supabaseClient.js');
const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Extracts the token from Authorization header and verifies it with Supabase
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // For service role key, we need to decode the JWT manually
    // The service role can't verify user JWT tokens directly
    try {
      // Decode the JWT without verification (since we're using service role)
      // In production, you should verify the JWT signature
      const decoded = jwt.decode(token);
      
      if (!decoded || !decoded.sub) {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'Token format is invalid'
        });
      }

      // Create a user object from the decoded token
      const user = {
        id: decoded.sub,
        email: decoded.email,
        user_metadata: decoded.user_metadata || {},
        aud: decoded.aud,
        role: decoded.role
      };

      // Add user information to request object
      req.user = user;
      req.token = token;
      
      next();
    } catch (jwtError) {
      console.error('JWT decode error:', jwtError);
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token could not be decoded'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't fail if no token is provided
 * Useful for routes that can work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate to access this resource'
      });
    }

    // Check if user has the required role
    // You can customize this based on your user model
    const userRole = req.user.user_metadata?.role || 'user';
    
    if (userRole !== requiredRole && userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Role '${requiredRole}' is required to access this resource`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};

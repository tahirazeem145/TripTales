import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware: Verifies JWT token on private routes
 * Attaches authenticated user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Format: "Bearer <token>" -> split by space and take index 1
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in database by ID stored in the token, omit password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      next(); // Proceed to the actual route controller
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

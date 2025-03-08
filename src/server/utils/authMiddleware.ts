import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService';

/**
 * Middleware to validate JWT tokens for protected routes
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

export default authMiddleware;
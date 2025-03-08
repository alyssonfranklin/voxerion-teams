import { Request, Response } from 'express';
import AuthService from '../services/authService';
import GraphService from '../services/graphService';
import DatabaseOperations from '../database/databaseOperations';

class AuthController {
  private authService: AuthService;
  private graphService: GraphService;
  private dbOps: DatabaseOperations;
  
  constructor() {
    this.authService = new AuthService();
    this.graphService = new GraphService();
    this.dbOps = new DatabaseOperations();
  }
  
  /**
   * Authenticates a user with a Microsoft Graph token
   */
  public authenticate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { msGraphToken } = req.body;
      
      if (!msGraphToken) {
        res.status(400).json({ success: false, error: 'Microsoft Graph token is required' });
        return;
      }
      
      // Get user info from Microsoft Graph
      const userInfo = await this.graphService.getUserInfo(msGraphToken);
      
      if (!userInfo || !userInfo.mail) {
        res.status(400).json({ success: false, error: 'Unable to retrieve user information' });
        return;
      }
      
      // Authenticate user
      const token = await this.authService.authenticateUser(userInfo.mail);
      
      if (!token) {
        res.status(403).json({
          success: false,
          error: 'User not authorized',
          userEmail: userInfo.mail
        });
        return;
      }
      
      res.json({
        success: true,
        data: {
          token,
          user: {
            email: userInfo.mail,
            name: userInfo.displayName
          }
        }
      });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  };
  
  /**
   * Validates an existing token
   */
  public validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const decoded = this.authService.verifyToken(token);
      
      if (!decoded) {
        res.status(401).json({ success: false, error: 'Invalid token' });
        return;
      }
      
      res.json({
        success: true,
        data: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Token validation failed'
      });
    }
  };
  
  /**
   * Clears user cache and forces a refresh of user data
   */
  public clearUserCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const decoded = this.authService.verifyToken(token);
      
      if (!decoded || !decoded.email) {
        res.status(401).json({ success: false, error: 'Invalid token' });
        return;
      }
      
      await this.dbOps.clearUserCache(decoded.email);
      
      res.json({
        success: true,
        message: 'User cache cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing user cache:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear user cache'
      });
    }
  };
}

export default AuthController;
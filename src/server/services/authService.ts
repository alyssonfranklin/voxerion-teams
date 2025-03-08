import * as jwt from 'jsonwebtoken';
import DatabaseOperations from '../database/databaseOperations';

/**
 * Service for handling authentication and authorization
 */
class AuthService {
  private db: DatabaseOperations;
  private jwtSecret: string;
  
  constructor() {
    this.db = new DatabaseOperations();
    
    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not found in environment variables');
    }
    
    this.jwtSecret = jwtSecret;
  }
  
  /**
   * Authenticates a user and returns a JWT token
   * 
   * @param email - User's email address
   * @returns JWT token or null if authentication fails
   */
  public async authenticateUser(email: string): Promise<string | null> {
    try {
      // Get user access details
      const userAccess = await this.db.getUserAccessDetails(email);
      if (!userAccess) {
        return null;
      }
      
      // Check if user's company is active
      if (userAccess.status !== 'active') {
        return null;
      }
      
      // Create JWT token
      const token = jwt.sign(
        {
          userId: userAccess.userId,
          email,
          role: userAccess.role,
          companyId: userAccess.companyId
        },
        this.jwtSecret,
        { expiresIn: '8h' }
      );
      
      return token;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  /**
   * Verifies a JWT token and returns the decoded payload
   * 
   * @param token - JWT token to verify
   * @returns Decoded token payload or null if verification fails
   */
  public verifyToken(token: string): any | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
  
  /**
   * Gets user assistant ID from email
   * 
   * @param email - User's email address
   * @returns Assistant ID or null if not found
   */
  public async getUserAssistantId(email: string): Promise<string | null> {
    try {
      const userAccess = await this.db.getUserAccessDetails(email);
      return userAccess ? userAccess.assistantId : null;
    } catch (error) {
      console.error('Error getting user assistant ID:', error);
      return null;
    }
  }
}

export default AuthService;
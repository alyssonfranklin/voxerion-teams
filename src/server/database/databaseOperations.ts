import { UserAccessDetails, User, Company } from '@/types';
import DatabaseManager from './databaseManager';

/**
 * Database Operations class for the Voxerion Teams application.
 * Provides higher-level operations for database interactions.
 */
class DatabaseOperations {
  private db: DatabaseManager;
  
  constructor() {
    this.db = new DatabaseManager();
  }
  
  /**
   * Gets user access details, including company and assistant information
   * 
   * @param email - User's email address
   * @param skipCache - If true, bypasses the cache for a fresh lookup
   * @returns User access details or null if not authorized
   */
  public async getUserAccessDetails(email: string, skipCache: boolean = false): Promise<UserAccessDetails | null> {
    try {
      console.log('Getting access details for email:', email, 'skipCache:', skipCache);
      
      // Get user by exact email match, with optional cache bypass
      const user = await this.db.getUserByEmail(email, skipCache);
      if (!user) {
        console.log('User not found for email:', email);
        return null;
      }
      console.log('Found user:', JSON.stringify(user));
      
      // Get company using user's company_id
      const company = await this.db.getCompanyById(user.companyId);
      if (!company) {
        console.log('Company not found for id:', user.companyId);
        return null;
      }
      console.log('Found company:', JSON.stringify(company));
      console.log('Using Assistant ID:', company.assistantId);
      
      return {
        userId: user.id,
        companyId: company.id,
        assistantId: company.assistantId,
        role: user.systemRole,
        status: company.status
      };
    } catch (error) {
      console.error('Error getting user access details:', error);
      return null;
    }
  }
  
  /**
   * Clears the cache for a specific user
   * 
   * @param email - User's email address
   */
  public async clearUserCache(email: string): Promise<void> {
    await this.db.clearUserCache(email);
  }
  
  /**
   * Creates a new access token for a user
   * 
   * @param email - User's email address
   * @returns Access token or throws error if user not authorized
   */
  public async createAccessToken(email: string): Promise<string> {
    try {
      const user = await this.db.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      
      const token = await this.db.createToken(user.id);
      return token.token;
    } catch (error) {
      console.error('Error creating access token:', error);
      throw error;
    }
  }
  
  /**
   * Validates an access token
   * 
   * @param token - The token to validate
   * @returns True if token is valid
   */
  public async validateToken(token: string): Promise<boolean> {
    try {
      return await this.db.validateToken(token);
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
  
  /**
   * Saves an insight for a calendar event or chat conversation
   * 
   * @param sourceId - ID of the event or chat
   * @param content - The insight content
   * @param type - Type of insight (calendar or chat)
   * @returns The created insight object
   */
  public async saveInsight(sourceId: string, content: string, type: 'calendar' | 'chat'): Promise<string> {
    try {
      const insight = await this.db.saveInsight({
        content,
        sourceId,
        type
      });
      
      return insight.id;
    } catch (error) {
      console.error('Error saving insight:', error);
      throw error;
    }
  }
  
  /**
   * Gets an insight by source ID (event ID or chat ID)
   * 
   * @param sourceId - ID of the event or chat
   * @returns The insight object or null if not found
   */
  public async getInsightBySourceId(sourceId: string): Promise<string | null> {
    try {
      const insight = await this.db.getInsightBySourceId(sourceId);
      return insight ? insight.content : null;
    } catch (error) {
      console.error('Error getting insight:', error);
      return null;
    }
  }
}

export default DatabaseOperations;
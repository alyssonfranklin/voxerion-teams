import { Request, Response } from 'express';
import GraphService from '../services/graphService';
import OpenAIService from '../services/openaiService';
import DatabaseOperations from '../database/databaseOperations';
import AuthService from '../services/authService';

class ChatController {
  private graphService: GraphService;
  private openaiService: OpenAIService;
  private dbOps: DatabaseOperations;
  private authService: AuthService;
  
  constructor() {
    this.graphService = new GraphService();
    this.openaiService = new OpenAIService();
    this.dbOps = new DatabaseOperations();
    this.authService = new AuthService();
  }
  
  /**
   * Get chat messages
   */
  public getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const { chatId } = req.params;
      const { limit } = req.query;
      
      const messages = await this.graphService.getChatMessages(
        token,
        chatId,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve chat messages'
      });
    }
  };
  
  /**
   * Generate insights for a chat conversation
   */
  public generateInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const { chatId } = req.params;
      
      // Check for cached insights first
      const cachedInsight = await this.dbOps.getInsightBySourceId(chatId);
      if (cachedInsight) {
        res.json({ success: true, data: { content: cachedInsight } });
        return;
      }
      
      // Get chat messages
      const messages = await this.graphService.getChatMessages(token, chatId);
      
      // Get user info
      const decodedToken = this.authService.verifyToken(token);
      if (!decodedToken || !decodedToken.email) {
        res.status(401).json({ success: false, error: 'Invalid token' });
        return;
      }
      
      // Get Assistant ID for the user
      const assistantId = await this.authService.getUserAssistantId(decodedToken.email);
      if (!assistantId) {
        res.status(403).json({ success: false, error: 'No Assistant ID found for user' });
        return;
      }
      
      // Generate insights
      const insightContent = await this.openaiService.generateChatInsight(messages, assistantId);
      
      // Save to cache
      await this.dbOps.saveInsight(chatId, insightContent, 'chat');
      
      res.json({ success: true, data: { content: insightContent } });
    } catch (error) {
      console.error('Error generating insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate insights'
      });
    }
  };
}

export default ChatController;
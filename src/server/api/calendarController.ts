import { Request, Response } from 'express';
import GraphService from '../services/graphService';
import OpenAIService from '../services/openaiService';
import DatabaseOperations from '../database/databaseOperations';
import AuthService from '../services/authService';

class CalendarController {
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
   * Get calendar events
   */
  public getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const { startDateTime, endDateTime } = req.query;
      
      const events = await this.graphService.getCalendarEvents(
        token,
        startDateTime as string,
        endDateTime as string
      );
      
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve calendar events'
      });
    }
  };
  
  /**
   * Get a specific calendar event
   */
  public getEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const { eventId } = req.params;
      
      const event = await this.graphService.getCalendarEvent(token, eventId);
      
      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Error getting event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve calendar event'
      });
    }
  };
  
  /**
   * Generate insights for a calendar event
   */
  public generateInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
      }
      
      const { eventId } = req.params;
      
      // Check for cached insights first
      const cachedInsight = await this.dbOps.getInsightBySourceId(eventId);
      if (cachedInsight) {
        res.json({ success: true, data: { content: cachedInsight } });
        return;
      }
      
      // Get event details
      const event = await this.graphService.getCalendarEvent(token, eventId);
      
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
      const insightContent = await this.openaiService.generateCalendarInsight(event, assistantId);
      
      // Save to cache
      await this.dbOps.saveInsight(eventId, insightContent, 'calendar');
      
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

export default CalendarController;
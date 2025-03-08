import { Client } from '@microsoft/microsoft-graph-client';
import { CalendarEvent, ChatMessage } from '@/types';

/**
 * Service for interacting with Microsoft Graph API
 */
class GraphService {
  /**
   * Creates a Microsoft Graph client with the provided access token
   * 
   * @param accessToken - Microsoft Graph access token
   * @returns Authenticated Graph client
   */
  private createClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }
  
  /**
   * Retrieves user calendar events
   * 
   * @param accessToken - Microsoft Graph access token
   * @param startDateTime - Start of the time range
   * @param endDateTime - End of the time range
   * @returns List of calendar events
   */
  public async getCalendarEvents(
    accessToken: string,
    startDateTime?: string,
    endDateTime?: string
  ): Promise<CalendarEvent[]> {
    try {
      const client = this.createClient(accessToken);
      
      // Default to events in the next 7 days if no dates provided
      const start = startDateTime || new Date().toISOString();
      const end = endDateTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const events = await client
        .api('/me/calendar/events')
        .filter(`start/dateTime ge '${start}' and end/dateTime le '${end}'`)
        .select('id,subject,organizer,attendees,start,end,bodyPreview,location')
        .orderby('start/dateTime')
        .get();
      
      return events.value;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw new Error('Failed to retrieve calendar events');
    }
  }
  
  /**
   * Gets a specific calendar event by ID
   * 
   * @param accessToken - Microsoft Graph access token
   * @param eventId - ID of the event to retrieve
   * @returns The calendar event
   */
  public async getCalendarEvent(accessToken: string, eventId: string): Promise<CalendarEvent> {
    try {
      const client = this.createClient(accessToken);
      
      const event = await client
        .api(`/me/calendar/events/${eventId}`)
        .select('id,subject,organizer,attendees,start,end,bodyPreview,location')
        .get();
      
      return event;
    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw new Error('Failed to retrieve calendar event');
    }
  }
  
  /**
   * Retrieves chat messages from a Teams chat
   * 
   * @param accessToken - Microsoft Graph access token
   * @param chatId - ID of the chat to retrieve messages from
   * @param limit - Maximum number of messages to retrieve
   * @returns List of chat messages
   */
  public async getChatMessages(
    accessToken: string, 
    chatId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    try {
      const client = this.createClient(accessToken);
      
      const messages = await client
        .api(`/chats/${chatId}/messages`)
        .top(limit)
        .orderby('createdDateTime desc')
        .get();
      
      return messages.value;
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw new Error('Failed to retrieve chat messages');
    }
  }
  
  /**
   * Gets user information from Microsoft Graph
   * 
   * @param accessToken - Microsoft Graph access token
   * @returns User information
   */
  public async getUserInfo(accessToken: string): Promise<any> {
    try {
      const client = this.createClient(accessToken);
      
      const user = await client
        .api('/me')
        .select('id,displayName,mail,userPrincipalName')
        .get();
      
      return user;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to retrieve user information');
    }
  }
}

export default GraphService;
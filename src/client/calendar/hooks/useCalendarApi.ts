import { useState } from 'react';
import { CalendarEvent } from '@/types';
import { useAuth } from '../../shared/hooks/useAuth';

export const useCalendarApi = () => {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  
  /**
   * Get events from the calendar API
   * 
   * @param startDateTime - Start of the time range
   * @param endDateTime - End of the time range
   * @returns List of calendar events
   */
  const getEvents = async (
    startDateTime?: string,
    endDateTime?: string
  ): Promise<CalendarEvent[]> => {
    try {
      setLoading(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      let url = '/api/calendar/events';
      const params = new URLSearchParams();
      
      if (startDateTime) {
        params.append('startDateTime', startDateTime);
      }
      
      if (endDateTime) {
        params.append('endDateTime', endDateTime);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      const data = await response.json();
      
      return data.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get a specific calendar event by ID
   * 
   * @param eventId - ID of the event to retrieve
   * @returns The calendar event
   */
  const getEvent = async (eventId: string): Promise<CalendarEvent> => {
    try {
      setLoading(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar event');
      }
      
      const data = await response.json();
      
      return data.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Generate insights for a calendar event
   * 
   * @param eventId - ID of the event to generate insights for
   * @returns Generated insight text
   */
  const generateInsights = async (eventId: string): Promise<string> => {
    try {
      setLoading(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`/api/calendar/events/${eventId}/insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }
      
      const data = await response.json();
      
      return data.data.content;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    getEvents,
    getEvent,
    generateInsights,
    loading
  };
};
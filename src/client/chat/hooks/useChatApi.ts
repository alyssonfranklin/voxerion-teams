import { useState } from 'react';
import { ChatMessage } from '@/types';
import { useAuth } from '../../shared/hooks/useAuth';

export const useChatApi = () => {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  
  /**
   * Get messages from a Teams chat
   * 
   * @param chatId - ID of the chat to retrieve messages from
   * @param limit - Maximum number of messages to retrieve
   * @returns List of chat messages
   */
  const getMessages = async (chatId: string, limit?: number): Promise<ChatMessage[]> => {
    try {
      setLoading(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      let url = `/api/chat/${chatId}/messages`;
      
      if (limit) {
        url += `?limit=${limit}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      
      const data = await response.json();
      
      return data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Generate insights for a chat conversation
   * 
   * @param chatId - ID of the chat to generate insights for
   * @returns Generated insight text
   */
  const generateInsights = async (chatId: string): Promise<string> => {
    try {
      setLoading(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`/api/chat/${chatId}/insights`, {
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
    getMessages,
    generateInsights,
    loading
  };
};
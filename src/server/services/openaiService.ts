import OpenAI from 'openai';
import { CalendarEvent, ChatMessage } from '@/types';

/**
 * Service to handle interactions with OpenAI API
 */
class OpenAIService {
  private client: OpenAI;
  private validatedAssistants: Set<string> = new Set();
  
  constructor() {
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    this.client = new OpenAI({
      apiKey
    });
  }
  
  /**
   * Validates that an Assistant ID exists and is accessible
   * 
   * @param assistantId - The OpenAI Assistant ID to validate
   * @returns True if valid
   */
  public async validateAssistant(assistantId: string): Promise<boolean> {
    try {
      // Check cache first
      if (this.validatedAssistants.has(assistantId)) {
        console.log('Using cached assistant validation');
        return true;
      }
      
      console.log('Validating assistant...', assistantId);
      const assistant = await this.client.beta.assistants.retrieve(assistantId);
      
      if (assistant && assistant.id) {
        console.log('Assistant validated:', assistant.id);
        this.validatedAssistants.add(assistantId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Assistant validation failed:', error);
      return false;
    }
  }
  
  /**
   * Generates insights for a calendar event
   * 
   * @param event - The calendar event
   * @param assistantId - OpenAI Assistant ID
   * @returns Generated insight text
   */
  public async generateCalendarInsight(event: CalendarEvent, assistantId: string): Promise<string> {
    try {
      // Validate the assistant ID
      const isValid = await this.validateAssistant(assistantId);
      if (!isValid) {
        throw new Error(`Invalid Assistant ID: ${assistantId}`);
      }
      
      // Format attendees
      const attendees = event.attendees.map(a => a.emailAddress.name).join(', ');
      
      // Create a prompt with meeting details
      const prompt = `
[SYSTEM NOTE: You are ${assistantId}. Start your response by confirming your ID.]

Meeting Details:
- Title: ${event.subject}
- Participants: ${attendees}
- Start Time: ${new Date(event.start.dateTime).toLocaleString()}
- End Time: ${new Date(event.end.dateTime).toLocaleString()}
${event.bodyPreview ? `- Description: ${event.bodyPreview}` : ''}

Baseado no seu conhecimento, veja as provas de personalidade de cada usuario e por favor crie insights sobre este evento. Como me comunicar? O que dizer e o que não dizer? Como fazer com que a comunicação seja assertiva e enriquecedora para todos os assistentes?

IMPORTANTE: Comece sua resposta com "Eu sou o assistente [SEU NOME] (ID: ${assistantId})"`;
      
      // Create a thread
      const thread = await this.client.beta.threads.create({});
      
      // Add message to thread
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt
      });
      
      // Run the assistant
      const run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
      });
      
      // Poll for completion
      const maxAttempts = 15;
      let attempts = 0;
      let runStatus;
      
      do {
        // Exponential backoff
        const delay = Math.min(500 * Math.pow(1.5, attempts), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Check run status
        const statusData = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
        runStatus = statusData.status;
        
        console.log(`Run status (attempt ${attempts + 1}):`, runStatus);
        
        // If completed, retrieve the message
        if (runStatus === 'completed') {
          const messages = await this.client.beta.threads.messages.list(thread.id);
          
          if (messages.data && messages.data.length > 0) {
            const textContent = messages.data[0].content.find(c => 
              c.type === 'text'
            );
            
            if (textContent && 'text' in textContent) {
              return textContent.text.value;
            }
          }
          
          throw new Error('Invalid message format received');
        }
        
        // Handle errors and failures
        if (runStatus === 'failed') {
          throw new Error('Run failed');
        }
        
        attempts++;
      } while (attempts < maxAttempts);
      
      throw new Error(`Timeout after ${maxAttempts} attempts. Last status: ${runStatus}`);
    } catch (error) {
      console.error('OpenAI request failed:', error);
      throw new Error('Failed to generate insights: ' + (error as Error).message);
    }
  }
  
  /**
   * Generates insights for a chat conversation
   * 
   * @param messages - The chat messages
   * @param assistantId - OpenAI Assistant ID
   * @returns Generated insight text
   */
  public async generateChatInsight(messages: ChatMessage[], assistantId: string): Promise<string> {
    try {
      // Validate the assistant ID
      const isValid = await this.validateAssistant(assistantId);
      if (!isValid) {
        throw new Error(`Invalid Assistant ID: ${assistantId}`);
      }
      
      // Format the chat conversation
      const formattedMessages = messages.map(msg => {
        const sender = msg.from.user?.displayName || 'Unknown';
        return `${sender}: ${msg.content}`;
      }).join('\n');
      
      // Create a prompt with chat details
      const prompt = `
[SYSTEM NOTE: You are ${assistantId}. Start your response by confirming your ID.]

Chat Conversation:
${formattedMessages}

Baseado no seu conhecimento, veja as provas de personalidade de cada usuario e por favor crie insights sobre esta conversa de chat. Como melhorar a comunicação? O que poderia ter sido dito de forma diferente? Como fazer com que a comunicação seja mais assertiva e eficaz?

IMPORTANTE: Comece sua resposta com "Eu sou o assistente [SEU NOME] (ID: ${assistantId})"`;
      
      // Create a thread
      const thread = await this.client.beta.threads.create({});
      
      // Add message to thread
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt
      });
      
      // Run the assistant
      const run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
      });
      
      // Poll for completion
      const maxAttempts = 15;
      let attempts = 0;
      let runStatus;
      
      do {
        // Exponential backoff
        const delay = Math.min(500 * Math.pow(1.5, attempts), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Check run status
        const statusData = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
        runStatus = statusData.status;
        
        console.log(`Run status (attempt ${attempts + 1}):`, runStatus);
        
        // If completed, retrieve the message
        if (runStatus === 'completed') {
          const messages = await this.client.beta.threads.messages.list(thread.id);
          
          if (messages.data && messages.data.length > 0) {
            const textContent = messages.data[0].content.find(c => 
              c.type === 'text'
            );
            
            if (textContent && 'text' in textContent) {
              return textContent.text.value;
            }
          }
          
          throw new Error('Invalid message format received');
        }
        
        // Handle errors and failures
        if (runStatus === 'failed') {
          throw new Error('Run failed');
        }
        
        attempts++;
      } while (attempts < maxAttempts);
      
      throw new Error(`Timeout after ${maxAttempts} attempts. Last status: ${runStatus}`);
    } catch (error) {
      console.error('OpenAI request failed:', error);
      throw new Error('Failed to generate insights: ' + (error as Error).message);
    }
  }
}

export default OpenAIService;
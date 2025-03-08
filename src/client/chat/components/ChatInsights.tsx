import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  Text, 
  Button, 
  Spinner, 
  Title,
  Divider,
  mergeClasses
} from '@fluentui/react-components';
import { Copy24Regular, ArrowSync24Regular } from '@fluentui/react-icons';
import { useChatApi } from '../hooks/useChatApi';
import * as microsoftTeams from '@microsoft/teams-js';

const ChatInsights = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { generateInsights } = useChatApi();
  
  useEffect(() => {
    // Initialize Teams SDK
    microsoftTeams.initialize();
    
    // Get the current chat context
    microsoftTeams.getContext((context) => {
      if (context.chatId) {
        setChatId(context.chatId);
        fetchInsights(context.chatId);
      } else {
        setError('Unable to determine the current chat. Please try again.');
      }
    });
  }, []);
  
  const fetchInsights = async (chatIdentifier: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const insightContent = await generateInsights(chatIdentifier);
      setInsight(insightContent);
    } catch (err) {
      setError('Failed to generate insights. Please try again.');
      console.error('Error generating insights:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyInsight = () => {
    if (insight) {
      navigator.clipboard.writeText(insight)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
        });
    }
  };
  
  const handleRefresh = () => {
    if (chatId) {
      fetchInsights(chatId);
    }
  };
  
  return (
    <Card className="chat-insights-container">
      <CardHeader
        header={
          <Title>Chat Insights</Title>
        }
        description={
          <Text>AI-powered insights to improve your communication</Text>
        }
      />
      
      <div className="chat-insights-content">
        {loading ? (
          <div className="loading-container">
            <Spinner label="Analyzing conversation..." />
            <Text align="center">
              Please wait while we analyze your chat messages...
            </Text>
          </div>
        ) : error ? (
          <div className="error-container">
            <Text weight="semibold" className="error-message">{error}</Text>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="insight-header">
              <Text weight="semibold" size={500}>
                💬 Communication Insights
              </Text>
              
              <div className="insight-actions">
                <Button
                  icon={<ArrowSync24Regular />}
                  onClick={handleRefresh}
                  title="Refresh insights"
                >
                  Refresh
                </Button>
                
                <Button
                  icon={<Copy24Regular />}
                  onClick={handleCopyInsight}
                  className={mergeClasses('copy-button', copied && 'copied')}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            <Divider />
            
            <div className="insight-text">
              {insight ? (
                insight.split('\n').map((line, index) => (
                  <Text key={index} block>{line}</Text>
                ))
              ) : (
                <Text>No insights available. Try refreshing or checking a different chat.</Text>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ChatInsights;
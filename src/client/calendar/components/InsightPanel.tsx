import { useState, useEffect } from 'react';
import { 
  Spinner, 
  CardHeader, 
  Button, 
  Title,
  Text,
  Divider,
  mergeClasses
} from '@fluentui/react-components';
import { ArrowLeft24Regular, Copy24Regular } from '@fluentui/react-icons';
import { useCalendarApi } from '../hooks/useCalendarApi';

interface InsightPanelProps {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

const InsightPanel = ({ eventId, eventTitle, onBack }: InsightPanelProps) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { generateInsights } = useCalendarApi();
  
  useEffect(() => {
    fetchInsights();
  }, [eventId]);
  
  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const insightData = await generateInsights(eventId);
      setInsight(insightData);
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
  
  return (
    <>
      <CardHeader
        header={
          <Title>Meeting Insights</Title>
        }
        description={
          <Text>{eventTitle}</Text>
        }
      />
      
      <div className="insight-panel-content">
        <Button 
          appearance="subtle" 
          icon={<ArrowLeft24Regular />} 
          onClick={onBack}
          className="back-button"
        >
          Back to Meeting
        </Button>
        
        <Divider />
        
        {loading ? (
          <div className="loading-container">
            <Spinner label="Generating insights..." />
            <Text align="center">
              Please wait while we analyze your meeting details...
            </Text>
          </div>
        ) : error ? (
          <div className="error-container">
            <Text weight="semibold" className="error-message">{error}</Text>
            <Button onClick={fetchInsights}>Try Again</Button>
          </div>
        ) : (
          <div className="insight-content">
            <div className="insight-header">
              <Text weight="semibold" size={500}>
                📊 AI-Generated Insights
              </Text>
              
              <Button
                icon={<Copy24Regular />}
                onClick={handleCopyInsight}
                className={mergeClasses('copy-button', copied && 'copied')}
              >
                {copied ? 'Copied!' : 'Copy Insights'}
              </Button>
            </div>
            
            <Divider />
            
            <div className="insight-text">
              {insight?.split('\n').map((line, index) => (
                <Text key={index} block>{line}</Text>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InsightPanel;
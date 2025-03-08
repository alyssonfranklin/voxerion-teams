import { useState, useEffect } from 'react';
import { 
  Button, 
  Spinner, 
  Card, 
  CardHeader,
  Text, 
  Title,
  Divider
} from '@fluentui/react-components';
import { 
  CalendarAgenda24Regular, 
  InsightsRegular 
} from '@fluentui/react-icons';
import { CalendarEvent } from '@/types';
import { useCalendarApi } from '../hooks/useCalendarApi';
import EventCard from './EventCard';
import InsightPanel from './InsightPanel';

const CalendarView = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  
  const { getEvents } = useCalendarApi();
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get today's date at midnight
      const startDateTime = new Date();
      startDateTime.setHours(0, 0, 0, 0);
      
      // Get 7 days from now at midnight
      const endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + 7);
      
      const eventsData = await getEvents(
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );
      
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to load calendar events. Please try again.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowInsight(false);
  };
  
  const handleGetInsight = () => {
    if (selectedEvent) {
      setShowInsight(true);
    }
  };
  
  const handleBackToEvent = () => {
    setShowInsight(false);
  };
  
  return (
    <div className="calendar-view">
      <Card className="calendar-container">
        <CardHeader
          header={
            <Title>Upcoming Meetings</Title>
          }
          action={
            <Button 
              appearance="subtle" 
              icon={<CalendarAgenda24Regular />}
              onClick={fetchEvents}
              disabled={loading}
            >
              Refresh
            </Button>
          }
        />
        
        {loading ? (
          <div className="loading-container">
            <Spinner label="Loading calendar events..." />
          </div>
        ) : error ? (
          <div className="error-container">
            <Text weight="semibold" className="error-message">{error}</Text>
            <Button onClick={fetchEvents}>Try Again</Button>
          </div>
        ) : (
          <div className="events-container">
            {events.length === 0 ? (
              <Text>No upcoming meetings found.</Text>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent?.id === event.id}
                    onClick={() => handleEventSelect(event)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
      
      {selectedEvent && (
        <Card className="event-detail-container">
          {showInsight ? (
            <InsightPanel
              eventId={selectedEvent.id}
              eventTitle={selectedEvent.subject}
              onBack={handleBackToEvent}
            />
          ) : (
            <>
              <CardHeader
                header={
                  <Title>{selectedEvent.subject}</Title>
                }
              />
              
              <div className="event-details">
                <Text weight="semibold">
                  {new Date(selectedEvent.start.dateTime).toLocaleString()} - {new Date(selectedEvent.end.dateTime).toLocaleTimeString()}
                </Text>
                
                <Divider />
                
                <Text weight="semibold">Attendees:</Text>
                <div className="attendees-list">
                  {selectedEvent.attendees.map((attendee, index) => (
                    <Text key={index}>{attendee.emailAddress.name}</Text>
                  ))}
                </div>
                
                {selectedEvent.bodyPreview && (
                  <>
                    <Divider />
                    <Text weight="semibold">Description:</Text>
                    <Text>{selectedEvent.bodyPreview}</Text>
                  </>
                )}
                
                <Divider />
                
                <Button
                  appearance="primary"
                  className="insights-button"
                  icon={<InsightsRegular />}
                  onClick={handleGetInsight}
                >
                  Get Insights
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default CalendarView;
import { Card, CardHeader, Text, mergeClasses } from '@fluentui/react-components';
import { CalendarLtr20Regular } from '@fluentui/react-icons';
import { CalendarEvent } from '@/types';

interface EventCardProps {
  event: CalendarEvent;
  isSelected: boolean;
  onClick: () => void;
}

const EventCard = ({ event, isSelected, onClick }: EventCardProps) => {
  const startTime = new Date(event.start.dateTime);
  const endTime = new Date(event.end.dateTime);
  
  // Format time for display
  const timeString = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
  // Check if event is today
  const isToday = new Date().toDateString() === startTime.toDateString();
  
  // Check if event is happening now
  const now = new Date();
  const isNow = now >= startTime && now <= endTime;
  
  // Calculate time until event starts
  const getTimeUntilStart = () => {
    if (isNow) return 'Happening now';
    
    const diffMs = startTime.getTime() - now.getTime();
    if (diffMs < 0) return 'Already started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `Starts in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `Starts in ${diffMinutes}m`;
    }
  };
  
  return (
    <Card 
      className={mergeClasses(
        'event-card',
        isSelected && 'selected',
        isNow && 'happening-now'
      )}
      onClick={onClick}
    >
      <CardHeader
        header={<Text weight="semibold">{event.subject}</Text>}
        description={
          <div className="event-card-description">
            <div className="event-time">
              <CalendarLtr20Regular />
              <Text>{timeString}</Text>
            </div>
            <Text className={mergeClasses(
              'event-status',
              isNow && 'happening-now-text'
            )}>
              {isToday ? getTimeUntilStart() : startTime.toLocaleDateString()}
            </Text>
          </div>
        }
      />
      <div className="event-card-content">
        {event.location?.displayName && (
          <Text size={200}>📍 {event.location.displayName}</Text>
        )}
        <Text size={200}>
          👥 {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
        </Text>
      </div>
    </Card>
  );
};

export default EventCard;
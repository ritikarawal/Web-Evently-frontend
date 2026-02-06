interface EventCardProps {
  event: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    capacity?: number;
    ticketPrice?: number;
    organizer?: any;
    attendees?: any[];
  };
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
      <div className="space-y-2 text-sm text-gray-500">
        <p><strong>Start:</strong> {formatDate(event.startDate)}</p>
        <p><strong>End:</strong> {formatDate(event.endDate)}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Category:</strong> {event.category}</p>
        {event.capacity && <p><strong>Capacity:</strong> {event.capacity}</p>}
        {event.ticketPrice && event.ticketPrice > 0 && (
          <p><strong>Price:</strong> ${event.ticketPrice}</p>
        )}
      </div>
    </div>
  );
}
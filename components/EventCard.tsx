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
    isPublic?: boolean;
  };
  showActions?: boolean;
  onEdit?: (event: any) => void;
  onDelete?: (eventId: string) => void;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  currentUserId?: string;
  isLoggedIn?: boolean;
}

export default function EventCard({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onJoin, 
  onLeave, 
  currentUserId,
  isLoggedIn = false 
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserAttending = currentUserId && event.attendees?.some(attendee => 
    typeof attendee === 'string' ? attendee === currentUserId : attendee._id === currentUserId
  );
  const availableSeats = event.capacity ? event.capacity - (event.attendees?.length || 0) : null;
  const isFull = availableSeats !== null && availableSeats <= 0;

  return (
    <div className="bg-white rounded-[25px] shadow-xl hover:shadow-2xl transition-all duration-300 p-8 hover:scale-[1.02] border border-white/50 group">
      {/* Event Title with Gradient */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent group-hover:from-[var(--primary-light)] group-hover:to-[var(--primary)] transition-all duration-300">
          🎉 {event.title}
        </h3>
        {event.isPublic && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Public
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[var(--text-secondary)] mb-6 line-clamp-3 leading-relaxed font-['Poppins'] text-[16px]">
        {event.description}
      </p>

      {/* Event Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary-light)] to-[var(--surface)] rounded-xl">
          <span className="text-lg">📅</span>
          <div>
            <p className="font-semibold text-[var(--primary)] font-['Plus_Jakarta_Sans']">Start Date</p>
            <p className="text-[var(--text-secondary)] font-['Poppins']">{formatDate(event.startDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary-light)] to-[var(--surface)] rounded-xl">
          <span className="text-lg">⏰</span>
          <div>
            <p className="font-semibold text-[var(--primary)] font-['Plus_Jakarta_Sans']">End Date</p>
            <p className="text-[var(--text-secondary)] font-['Poppins']">{formatDate(event.endDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary-light)] to-[var(--surface)] rounded-xl">
          <span className="text-lg">📍</span>
          <div>
            <p className="font-semibold text-[var(--primary)] font-['Plus_Jakarta_Sans']">Location</p>
            <p className="text-[var(--text-secondary)] font-['Poppins']">{event.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary-light)] to-[var(--surface)] rounded-xl">
          <span className="text-lg">🏷️</span>
          <div>
            <p className="font-semibold text-[var(--primary)] font-['Plus_Jakarta_Sans']">Category</p>
            <p className="text-[var(--text-secondary)] font-['Poppins']">{event.category}</p>
          </div>
        </div>

        {event.capacity && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary-light)] to-[var(--surface)] rounded-xl">
            <span className="text-lg">👥</span>
            <div>
              <p className="font-semibold text-[var(--primary)] font-['Plus_Jakarta_Sans']">Capacity</p>
              <p className="text-[var(--text-secondary)] font-['Poppins']">
                {event.attendees?.length || 0} / {event.capacity} attending
                {availableSeats !== null && availableSeats > 0 && (
                  <span className="text-green-600 font-medium ml-1">
                    ({availableSeats} seats left)
                  </span>
                )}
                {isFull && (
                  <span className="text-red-600 font-medium ml-1">
                    (Full)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {event.ticketPrice && event.ticketPrice > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-xl text-white">
            <span className="text-lg">💰</span>
            <div>
              <p className="font-semibold font-['Plus_Jakarta_Sans']">Ticket Price</p>
              <p className="font-['Poppins'] font-bold text-xl">${event.ticketPrice}</p>
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => onEdit?.(event)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this event?')) {
                onDelete?.(event._id);
              }
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Public Event Actions */}
      {event.isPublic && isLoggedIn && !showActions && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          {isUserAttending ? (
            <button
              onClick={() => onLeave?.(event._id)}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Leave Event
            </button>
          ) : (
            <button
              onClick={() => onJoin?.(event._id)}
              disabled={isFull}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isFull
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white hover:from-[var(--primary-light)] hover:to-[var(--primary)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {isFull ? 'Event Full' : 'Join Event'}
            </button>
          )}
          <button className="px-4 py-3 border border-[var(--primary)] text-[var(--primary)] rounded-lg font-medium hover:bg-[var(--primary)] hover:text-white transition-colors">
            View Details
          </button>
        </div>
      )}
    </div>
  );
}
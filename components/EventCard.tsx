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
  showActions?: boolean;
  onEdit?: (event: any) => void;
  onDelete?: (eventId: string) => void;
}

export default function EventCard({ event, showActions = false, onEdit, onDelete }: EventCardProps) {
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
    <div className="bg-white rounded-[25px] shadow-xl hover:shadow-2xl transition-all duration-300 p-8 hover:scale-[1.02] border border-white/50 group">
      {/* Event Title with Gradient */}
      <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-[#db8585] to-[#c76b6b] bg-clip-text text-transparent group-hover:from-[#c76b6b] group-hover:to-[#a85a5a] transition-all duration-300">
        🎉 {event.title}
      </h3>

      {/* Description */}
      <p className="text-[#49516f] mb-6 line-clamp-3 leading-relaxed font-['Poppins'] text-[16px]">
        {event.description}
      </p>

      {/* Event Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] rounded-xl">
          <span className="text-lg">📅</span>
          <div>
            <p className="font-semibold text-[#661a1a] font-['Plus_Jakarta_Sans']">Start Date</p>
            <p className="text-[#49516f] font-['Poppins']">{formatDate(event.startDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] rounded-xl">
          <span className="text-lg">⏰</span>
          <div>
            <p className="font-semibold text-[#661a1a] font-['Plus_Jakarta_Sans']">End Date</p>
            <p className="text-[#49516f] font-['Poppins']">{formatDate(event.endDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] rounded-xl">
          <span className="text-lg">📍</span>
          <div>
            <p className="font-semibold text-[#661a1a] font-['Plus_Jakarta_Sans']">Location</p>
            <p className="text-[#49516f] font-['Poppins']">{event.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] rounded-xl">
          <span className="text-lg">🏷️</span>
          <div>
            <p className="font-semibold text-[#661a1a] font-['Plus_Jakarta_Sans']">Category</p>
            <p className="text-[#49516f] font-['Poppins']">{event.category}</p>
          </div>
        </div>

        {event.capacity && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] rounded-xl">
            <span className="text-lg">👥</span>
            <div>
              <p className="font-semibold text-[#661a1a] font-['Plus_Jakarta_Sans']">Capacity</p>
              <p className="text-[#49516f] font-['Poppins']">{event.capacity} people</p>
            </div>
          </div>
        )}

        {event.ticketPrice && event.ticketPrice > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#db8585] to-[#c76b6b] rounded-xl text-white">
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
    </div>
  );
}
"use client";

import { useState } from "react";

interface Event {
  _id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
  capacity?: number;
  attendees?: Array<any>;
  ticketPrice?: number;
  isPublic?: boolean;
  organizer?: {
    firstName?: string;
    lastName?: string;
  };
  status?: string;
}

interface EventCardProps {
  event: Event;
  isOrganizer?: boolean;
  isUserAttending?: boolean;
  isLoggedIn?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (id: string) => void;
  onLeave?: (id: string) => void;
  onJoin?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isOrganizer = false,
  isUserAttending = false,
  isLoggedIn = false,
  onEdit,
  onDelete,
  onLeave,
  onJoin,
}) => {
  const [expanded, setExpanded] = useState(false);
  const availableSeats =
    event.capacity !== undefined && event.attendees
      ? event.capacity - event.attendees.length
      : null;
  const isFull = availableSeats !== null && availableSeats <= 0;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Colorful Top Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>

      {/* Main Content */}
      <div className="p-5">
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-indigo-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {event.title}
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 whitespace-nowrap">
                {event.isPublic ? "Public" : "Private"}
              </span>
            </div>
            <p className="text-xs text-gray-500">{event.category}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {event.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Start:</span>
            <span>{event.startDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">End:</span>
            <span>{event.endDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Cap:</span>
            <span>{event.capacity ?? "Unlimited"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Attend:</span>
            <span>{event.attendees?.length ?? 0}</span>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="text-xs text-gray-600 mb-3">
          <span className="font-semibold">By:</span>{" "}
          {event.organizer?.firstName} {event.organizer?.lastName}
        </div>

        {/* Ticket Price Badge */}
        {event.ticketPrice && event.ticketPrice > 0 ? (
          <div className="inline-block px-3 py-1 mb-3 bg-yellow-50 text-yellow-700 rounded-lg font-semibold text-xs border border-yellow-200">
            💰 ${event.ticketPrice}
          </div>
        ) : (
          <div className="inline-block px-3 py-1 mb-3 bg-green-50 text-green-700 rounded-lg font-semibold text-xs border border-green-200">
            Free Event
          </div>
        )}

        {/* Capacity Status */}
        {event.capacity && (
          <div
            className={`inline-block px-3 py-1 mb-3 ml-2 rounded-lg font-semibold text-xs ${
              isFull
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            👥 {event.attendees?.length ?? 0}/{event.capacity}
            {availableSeats !== null && availableSeats > 0 && ` (${availableSeats} left)`}
            {isFull && " (Full)"}
          </div>
        )}

        {/* Expanded Details Section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Location
                </p>
                <p className="text-sm text-gray-700">{event.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </p>
                  <p className="text-sm text-gray-700 capitalize">
                    {event.status || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Price
                  </p>
                  <p className="text-sm text-gray-700">
                    {event.ticketPrice ? `$${event.ticketPrice}` : "Free"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            {expanded ? "Hide Details" : "View Details"}
          </button>

          <div className="flex gap-2">
            {/* Organizer Actions */}
            {isOrganizer && (
              <>
                <button
                  onClick={() => onEdit?.(event)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit event"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this event?")
                    ) {
                      onDelete?.(event._id);
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Delete event"
                >
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* User Actions */}
            {event.isPublic && isLoggedIn && !isOrganizer && (
              <>
                {isUserAttending ? (
                  <button
                    onClick={() => onLeave?.(event._id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    Leave Event
                  </button>
                ) : (
                  <button
                    onClick={() => onJoin?.(event._id)}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${
                      isFull
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isFull ? "Event Full" : "Join Event"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
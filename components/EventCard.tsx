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
    showActions?: boolean;
    onBudgetResponse?: (eventId: string, accepted: boolean, counterProposal?: number, message?: string) => void;
    currentUserId?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isOrganizer = false,
  isUserAttending = false,
  isLoggedIn = false,
  onEdit,
  onDelete,
  onLeave,
  onJoin,
  showActions,
  onBudgetResponse,
  currentUserId,
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
                <p className="text-xs font-semibold text-gray-600 mb-1">Location</p>
                <p className="text-sm text-gray-700">{event.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Status</p>
                  <p className="text-sm text-gray-700 capitalize">{event.status || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Price</p>
                  <p className="text-sm text-gray-700">{event.ticketPrice && event.ticketPrice > 0 ? `$${event.ticketPrice}` : "Free"}</p>
                </div>
              </div>
            </div>
            <button
              className="mt-2 text-xs text-indigo-600 hover:underline focus:outline-none"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
        
        {/* Expand/Collapse Button */}
        <button
          className="mt-2 text-xs text-indigo-600 hover:underline focus:outline-none"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      </div>
    </div>
  );
};
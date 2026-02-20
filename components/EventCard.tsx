"use client";

import { useState } from "react";

    // ...existing code...
  // Define the Event type (should match your backend or props)
  interface Event {
    _id: string;
    category?: string;
    capacity?: number;
    attendees?: Array<any>;
    ticketPrice?: number;
    proposedBudget?: number;
    adminProposedBudget?: number;
    finalBudget?: number;
    budgetStatus?: string;
    isPublic?: boolean;
  }

  interface EventCardProps {
    event: Event;
    isOrganizer?: boolean;
    isUserAttending?: boolean;
    isLoggedIn?: boolean;
    showActions?: boolean;
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
    showActions = false,
    onEdit,
    onDelete,
    onLeave,
    onJoin,
  }) => {
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const availableSeats = event.capacity !== undefined && event.attendees ? event.capacity - event.attendees.length : null;
    const isFull = availableSeats !== null && availableSeats <= 0;

    return (
      <div>
        {/* Budget Modal (placeholder, implement as needed) */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-700 to-pink-600 p-6 text-white flex items-center justify-between">
                <h3 className="text-2xl font-bold">Budget Review</h3>
                <button onClick={() => setShowBudgetModal(false)} className="p-2 hover:bg-white/20 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* ...add modal content here... */}
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="font-semibold text-[var(--primary)] font-['Plus_Jakarta_Sans']">Category</p>
          <p className="text-[var(--text-secondary)] font-['Poppins']">{event.category}</p>
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

        {/* Budget Status Card for Organizers */}
        {isOrganizer && (event.proposedBudget || event.adminProposedBudget || event.finalBudget) && (
          <div className="mt-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Budget Status</p>
                  <p className={`text-base font-bold ${
                    event.budgetStatus === 'accepted' ? 'text-green-700' :
                    event.budgetStatus === 'rejected' ? 'text-red-700' :
                    event.budgetStatus === 'negotiating' ? 'text-yellow-700' :
                    'text-gray-700'
                  }`}>
                    {event.budgetStatus ? event.budgetStatus.toUpperCase() : 'PENDING'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBudgetModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
                View Details
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {event.proposedBudget && (
                  <div className="bg-emerald-100 rounded-lg p-3 border border-emerald-300">
                    <p className="text-xs text-emerald-700 font-medium">Your Proposal</p>
                    <p className="text-lg font-bold text-emerald-900">${event.proposedBudget.toLocaleString()}</p>
                  </div>
                )}
                {event.adminProposedBudget && (
                  <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
                    <p className="text-xs text-blue-700 font-medium">Admin Counter</p>
                    <p className="text-lg font-bold text-blue-900">${event.adminProposedBudget.toLocaleString()}</p>
                  </div>
                )}
                {event.finalBudget && (
                  <div className="bg-purple-100 rounded-lg p-3 border border-purple-300">
                    <p className="text-xs text-purple-700 font-medium">Final Agreement</p>
                    <p className="text-lg font-bold text-purple-900">${event.finalBudget.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showActions && isOrganizer && (
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

        {/* Show Leave button for attendees in My Events */}
        {showActions && !isOrganizer && isUserAttending && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => onLeave?.(event._id)}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Leave Event
            </button>
          </div>
        )}

        {/* Public Event Actions */}
        {event.isPublic && isLoggedIn && !showActions && !isOrganizer && (
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
  };

  export default EventCard;
"use client";

import { useState } from "react";

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
    // Budget fields
    proposedBudget?: number;
    adminProposedBudget?: number;
    finalBudget?: number;
    budgetStatus?: 'pending' | 'negotiating' | 'accepted' | 'rejected';
    budgetNegotiationHistory?: Array<{
      proposer: 'user' | 'admin';
      proposerId?: string;
      amount: number;
      message?: string;
      timestamp: string;
    }>;
    status?: 'draft' | 'published' | 'cancelled' | 'pending' | 'approved' | 'declined';
  };
  showActions?: boolean;
  onEdit?: (event: any) => void;
  onDelete?: (eventId: string) => void;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  onBudgetResponse?: (eventId: string, accepted: boolean, counterProposal?: number, message?: string) => void;
  currentUserId?: string;
  isLoggedIn?: boolean;
  isOrganizer?: boolean;
}

export default function EventCard({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onJoin, 
  onLeave,
  onBudgetResponse,
  currentUserId,
  isLoggedIn = false,
  isOrganizer = false
}: EventCardProps) {
  const [showBudgetModal, setShowBudgetModal] = useState(false);

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

  // Budget Conversation Modal
  if (showBudgetModal) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Budget Conversation</h3>
                  <p className="text-sm text-gray-600">{event.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  event.budgetStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                  event.budgetStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  event.budgetStatus === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.budgetStatus ? event.budgetStatus.charAt(0).toUpperCase() + event.budgetStatus.slice(1) : 'Unknown'}
                </span>
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Messaging Interface */}
              <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {/* Initial User Proposal */}
                  {event.proposedBudget && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="bg-green-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                          <div className="text-sm text-green-600 font-medium mb-2">Your Initial Proposal</div>
                          <div className="text-xl font-bold text-green-800">${event.proposedBudget.toLocaleString()}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-2">Event creation</div>
                      </div>
                    </div>
                  )}

                  {/* Admin Counter */}
                  {event.adminProposedBudget && (
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-end">
                        <div className="bg-red-100 rounded-2xl rounded-tr-md px-4 py-3 max-w-md">
                          <div className="text-sm text-red-600 font-medium mb-2">Admin Counter-Proposal</div>
                          <div className="text-xl font-bold text-red-800">${event.adminProposedBudget.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Budget */}
                  {event.finalBudget && (
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-end">
                        <div className="bg-purple-100 rounded-2xl rounded-tr-md px-4 py-3 max-w-md">
                          <div className="text-sm text-purple-600 font-medium mb-2">Final Agreement</div>
                          <div className="text-xl font-bold text-purple-800">${event.finalBudget.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Negotiation History */}
                  {event.budgetNegotiationHistory && event.budgetNegotiationHistory.length > 0 && (
                    <>
                      {event.budgetNegotiationHistory
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((item, index) => (
                        <div key={index} className={`flex items-start gap-3 ${item.proposer === 'admin' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.proposer === 'admin' ? 'bg-red-500' : 'bg-green-500'
                          }`}>
                            {item.proposer === 'admin' ? (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                          </div>
                          <div className={`flex-1 ${item.proposer === 'admin' ? 'flex justify-end' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 max-w-md ${
                              item.proposer === 'admin'
                                ? 'bg-red-100 rounded-tr-md'
                                : 'bg-green-100 rounded-tl-md'
                            }`}>
                              <div className={`text-sm font-medium mb-2 ${
                                item.proposer === 'admin' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {item.proposer === 'admin' ? 'Admin Counter-Proposal' : 'Your Counter-Proposal'}
                              </div>
                              <div className={`text-xl font-bold ${
                                item.proposer === 'admin' ? 'text-red-800' : 'text-green-800'
                              }`}>
                                ${item.amount.toLocaleString()}
                              </div>
                              {item.message && (
                                <div className={`text-sm mt-3 p-3 rounded-lg ${
                                  item.proposer === 'admin' ? 'bg-red-200' : 'bg-green-200'
                                }`}>
                                  "{item.message}"
                                </div>
                              )}
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${
                              item.proposer === 'admin' ? 'text-right mr-2' : 'ml-2'
                            }`}>
                              {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {event.adminProposedBudget && event.budgetStatus === 'negotiating' && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onBudgetResponse?.(event._id, true)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Proposal
                  </button>
                  <button
                    onClick={() => {
                      const counterProposal = prompt('Enter your counter-proposal amount:');
                      if (counterProposal) {
                        const amount = parseFloat(counterProposal);
                        if (!isNaN(amount) && amount > 0) {
                          const message = prompt('Add a message (optional):');
                          onBudgetResponse?.(event._id, false, amount, message || undefined);
                          setShowBudgetModal(false);
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Counter-Propose
                  </button>
                  <button
                    onClick={() => {
                      const message = prompt('Reason for rejection (optional):');
                      onBudgetResponse?.(event._id, false, undefined, message || undefined);
                      setShowBudgetModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

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

        {/* Budget Icon for Organizers */}
        {isOrganizer && (event.proposedBudget || event.adminProposedBudget || event.finalBudget) && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Budget Conversation</p>
                <p className="text-xs text-blue-600">
                  {event.budgetStatus ? event.budgetStatus.charAt(0).toUpperCase() + event.budgetStatus.slice(1) : 'Unknown'} • 
                  {event.finalBudget ? `Final: $${event.finalBudget.toLocaleString()}` : 
                   event.adminProposedBudget ? `Admin: $${event.adminProposedBudget.toLocaleString()}` :
                   event.proposedBudget ? `Your: $${event.proposedBudget.toLocaleString()}` : 'No proposals yet'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              View Chat
            </button>
          </div>
        )}
      </div>

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
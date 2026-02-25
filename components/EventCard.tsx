"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoryTheme, getAudioForCategory } from "@/constants/categoryThemes";
import { X } from "lucide-react";
import { KhaltiPayButton } from "@/components/KhaltiPayButton"; 
import {
  clearPaymentStatus,
  getEventPaymentSummary,
  getPaymentNotifications,
  getPaymentStatus,
  setPaymentStatus as setStoredPaymentStatus,
  type PaymentStatus,
} from "@/lib/paymentStatus";
interface Event {
  _id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
  capacity?: number;
  attendees?: Array<any> | number;
  ticketPrice?: number;
  eventType?: 'paid' | 'free';
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
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [paymentStatus, setPaymentStatusState] = useState<PaymentStatus>("unpaid");
  const [paymentSummary, setPaymentSummary] = useState<{
    rows: { userId: string; name: string; status: PaymentStatus }[];
    paidCount: number;
    unpaidCount: number;
  }>({ rows: [], paidCount: 0, unpaidCount: 0 });
  const [paymentNotifications, setPaymentNotifications] = useState<
    { userId: string; status: PaymentStatus; timestamp: number; eventTitle?: string }[]
  >([]);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");
  
  const theme = getCategoryTheme(event.category);
  const audioPath = getAudioForCategory(event.category);

  const formatDate = (value?: string) => {
    if (!value) return "TBD";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString().slice(0, 10);
  };

  const getAttendeeCount = () => {
    if (Array.isArray(event.attendees)) return event.attendees.length;
    if (typeof event.attendees === "number") return event.attendees;
    return 0;
  };
  
  const attendeeCount = getAttendeeCount();
  const availableSeats =
    event.capacity !== undefined
      ? event.capacity - attendeeCount
      : null;
  const isFull = availableSeats !== null && availableSeats <= 0;

  useEffect(() => {
    // Create audio element for this event category
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = 0.3;
    setAudioRef(audio);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioPath]);

  // Auto-play music when envelope opens
  useEffect(() => {
    if (opened && audioRef && !isPlayingMusic) {
      audioRef.play().catch(err => console.log("Audio playback failed:", err));
      setIsPlayingMusic(true);
    } else if (!opened && audioRef && isPlayingMusic) {
      audioRef.pause();
      setIsPlayingMusic(false);
    }
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    if (currentUserId && event?._id) {
      const status = getPaymentStatus(event._id, currentUserId);
      setPaymentStatusState(status);
    }
    if (Array.isArray(event.attendees) && event?._id) {
      const summary = getEventPaymentSummary(event._id, event.attendees);
      setPaymentSummary(summary);
    }
    if (event?._id) {
      const notices = getPaymentNotifications(event._id);
      setPaymentNotifications(notices);
    }
  }, [opened, event?._id, event.attendees, currentUserId]);

  const toggleMusic = () => {
    if (audioRef) {
      if (isPlayingMusic) {
        audioRef.pause();
        setIsPlayingMusic(false);
      } else {
        audioRef.play().catch(err => console.log("Audio playback failed:", err));
        setIsPlayingMusic(true);
      }
    }
  };

  const handleOpenEnvelope = () => {
    setOpened(true);
  };

  const handleCloseEnvelope = () => {
    setOpened(false);
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
    setIsPlayingMusic(false);
  };

  const handlePrimaryAction = () => {
    if (!isLoggedIn) return;
    if (isOrganizer) return;
    if (isUserAttending) {
      if (onLeave && event._id) onLeave(event._id);
      if (currentUserId && event._id) {
        clearPaymentStatus(event._id, currentUserId);
        setPaymentStatusState("unpaid");
      }
      return;
    }
    if (isFull) return;
    if (onJoin && event._id) onJoin(event._id);
    if (currentUserId && event._id) {
      setStoredPaymentStatus(event._id, currentUserId, "unpaid");
      setPaymentStatusState("unpaid");
    }
  };

  const handleProceedPayment = () => {
    if (!event._id) return;
    const amount = event.ticketPrice ?? 0;
    const title = encodeURIComponent(event.title ?? "Event");
    router.push(`/payments?eventId=${event._id}&amount=${amount}&title=${title}`);
  };

  if (!opened) {
    // CLOSED ENVELOPE VIEW
    return (
      <div 
        onClick={handleOpenEnvelope}
        className="relative group cursor-pointer animate-card-slide-in hover:scale-105 transition-all duration-300"
        style={{ perspective: "1000px" }}
      >
        {/* Envelope Container */}
        <div className={`relative w-full h-64 bg-gradient-to-br ${theme.bgGradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 ${theme.borderColor}`}>
          
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">{theme.icon}</div>
            <div className="absolute bottom-4 right-4 text-6xl rotate-12">{theme.icon}</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">{theme.icon}</div>
          </div>

          {/* Envelope Flap (Top Triangle) */}
          <div 
            className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${theme.topBarGradient} transition-transform duration-700 group-hover:-translate-y-2 origin-top`}
            style={{
              clipPath: "polygon(0 0, 50% 100%, 100% 0)"
            }}
          >
            {/* Wax Seal Effect */}
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full ${theme.iconBg} border-4 ${theme.borderColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">{theme.icon}</span>
            </div>
          </div>

          {/* Content Preview on Envelope */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 px-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.badgeBg} border-2 ${theme.borderColor} mb-4 shadow-md`}>
              <span className="text-xl">{theme.icon}</span>
              <span className={`font-bold ${theme.textColor} text-sm`}>{theme.name}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2 line-clamp-2 px-4">
              {event.title}
            </h3>
            
            <p className={`text-sm font-semibold ${theme.textColor} mb-3`}>
              {event.organizer?.firstName} {event.organizer?.lastName}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1 text-xs text-gray-600">
              </div>
            </div>

            {/* Tap to Open Hint */}
            <div className={`mt-6 px-6 py-2 rounded-full bg-white/80 backdrop-blur-sm border-2 ${theme.borderColor} shadow-lg animate-bounce`}>
              <p className={`text-xs font-bold ${theme.textColor}`}>✨ Click to Open ✨</p>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.topBarGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
        </div>
      </div>
    );
  }

  // OPENED ENVELOPE VIEW (Full Event Details)
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-6 py-12">
        <div 
          className={`relative w-full max-w-7xl min-h-screen bg-gradient-to-br ${theme.bgGradient} rounded-3xl shadow-2xl border-4 ${theme.borderColor} animate-scale-in`}
        >
          {/* Decorative Top Border */}
          <div className={`h-3 w-full bg-gradient-to-r ${theme.topBarGradient} animate-shimmer`}></div>

          {/* Close Button - Sticky positioning */}
          <button
            onClick={handleCloseEnvelope}
            className="sticky top-2 float-right mr-4 mt-2 z-20 p-3 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:rotate-90 border-2 border-gray-200"
            title="Close envelope"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Music Control Button - Sticky positioning */}
          <button
            onClick={toggleMusic}
            className={`sticky top-2 ml-4 mt-2 z-20 px-4 py-2 rounded-full font-semibold text-sm shadow-lg transition-all duration-200 hover:scale-105 border-2 ${
              isPlayingMusic
                ? `bg-gradient-to-r ${theme.topBarGradient} text-white border-white/30`
                : `bg-white/95 ${theme.textColor} ${theme.borderColor}`
            }`}
            title={isPlayingMusic ? "Stop music" : "Play music"}
          >
            {isPlayingMusic ? "🎵 Playing" : "🔊 Play Music"}
          </button>

          {/* Opened Card Content */}
          <div className="p-8 sm:p-12 pt-6">
          {/* Header with Icon and Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${theme.iconBg} flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 ${theme.borderColor}`}>
                {theme.icon}
            </div>
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badgeBg} border ${theme.borderColor} mb-2`}>
                <span className="text-sm">{theme.icon}</span>
                <span className={`font-bold ${theme.textColor} text-xs`}>{theme.name}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <p className={`text-sm font-semibold ${theme.textColor}`}>
                By {event.organizer?.firstName} {event.organizer?.lastName}
              </p>
            </div>
          </div>

          {/* Event Info Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📅</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Start Date</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{formatDate(event.startDate)}</p>
            </div>
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏁</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>End Date</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{formatDate(event.endDate)}</p>
            </div>
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Capacity</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{event.capacity ?? "Unlimited"}</p>
            </div>
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📊</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Status</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 capitalize">{event.status || "Active"}</p>
            </div>
          </div>

          {/* Location and Description - Full Width */}
          <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📍</span>
              <p className={`text-xs font-bold ${theme.textColor}`}>Location</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{event.location}</p>
          </div>

          {event.description && (
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm mb-6`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📝</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Description</p>
              </div>
              <p className="text-sm text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Badges Row - Enhanced */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Paid/Free Badge and Khalti Button */}
            {event.eventType === 'paid' || (event.ticketPrice && event.ticketPrice > 0) ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-xl font-bold text-sm border-2 border-yellow-300 shadow-md">
                  💰 Paid{event.ticketPrice ? ` • $${event.ticketPrice}` : ''}
                </div>
                <KhaltiPayButton event={event} />
                {isUserAttending && !isOrganizer && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 shadow-md ${
                    paymentStatus === "paid"
                      ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300"
                      : "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300"
                  }`}>
                    {paymentStatus === "paid" ? "✅ Paid" : "⏳ Unpaid"}
                  </div>
                )}
              </>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-xl font-bold text-sm border-2 border-green-300 shadow-md">
                🎉 Free Event
              </div>
            )}

            {/* Attendees Badge */}
            {event.capacity && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 shadow-md animate-pulse ${
                isFull
                  ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300"
                  : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
              }`}>
                👥 {attendeeCount}/{event.capacity}
                {!isFull && availableSeats && availableSeats > 0 && ` • ${availableSeats} spots left`}
                {isFull && " • SOLD OUT"}
              </div>
            )}
          </div>

          {(event.eventType === 'paid' || (event.ticketPrice && event.ticketPrice > 0)) && isUserAttending && !isOrganizer && (
            <div className="mb-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-white/70 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-700">Payment Status</p>
                  <p className="text-xs text-gray-600">You can join now and pay later.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl">
                    {paymentStatus === "paid" ? "✔" : "#"}
                  </div>
                  <button
                    type="button"
                    onClick={handleProceedPayment}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all ${
                      paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                    }`}
                  >
                    {paymentStatus === "paid" ? "Paid" : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isOrganizer && Array.isArray(event.attendees) && event.attendees.length > 0 && (
            <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white/80 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Attendees Payment Status</p>
                  <p className="text-xs text-slate-500">Manage your event attendees</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-3 text-xs font-semibold">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Paid: {paymentSummary.paidCount}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Unpaid: {paymentSummary.unpaidCount}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAttendeesModal(true)}
                    className="px-5 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {showActions && isOrganizer && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={() => onEdit && onEdit(event)}
                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 bg-gradient-to-r ${theme.topBarGradient} hover:opacity-90`}
              >
                Edit Event
              </button>
              <button
                onClick={() => {
                  if (!onDelete || !event._id) return;
                  const confirmed = window.confirm("Delete this event? This action cannot be undone.");
                  if (confirmed) onDelete(event._id);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Delete Event
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handlePrimaryAction}
            disabled={!isLoggedIn || isOrganizer || isFull}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-200 bg-gradient-to-r ${theme.topBarGradient} ${
              !isLoggedIn || isOrganizer || isFull
                ? "opacity-60 cursor-not-allowed"
                : "hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {isOrganizer && "Organizer"}
            {!isOrganizer && !isLoggedIn && "Login to Join"}
            {!isOrganizer && isLoggedIn && isUserAttending && "Leave Event"}
            {!isOrganizer && isLoggedIn && !isUserAttending && isFull && "Event Full"}
            {!isOrganizer && isLoggedIn && !isUserAttending && !isFull && "Join Event"}
          </button>
        </div>
      </div>
      </div>

      {/* Enhanced Attendees Modal */}
      {showAttendeesModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => {
            setShowAttendeesModal(false);
            setSearchQuery("");
            setFilterStatus("all");
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Attendees Management</h3>
                  <p className="text-sm text-white/90 mt-1">
                    Total: {paymentSummary.rows.length} attendees
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAttendeesModal(false);
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search attendees by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      filterStatus === "all"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    All ({paymentSummary.rows.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus("paid")}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      filterStatus === "paid"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    Paid ({paymentSummary.paidCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus("unpaid")}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      filterStatus === "unpaid"
                        ? "bg-amber-600 text-white shadow-md"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    Unpaid ({paymentSummary.unpaidCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Attendees List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 250px)' }}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paymentSummary.rows
                    .filter(row => {
                      const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = filterStatus === "all" || row.status === filterStatus;
                      return matchesSearch && matchesFilter;
                    })
                    .map((row, idx) => (
                      <div 
                        key={`${row.userId}-${row.status}-${idx}`} 
                        className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 px-4 py-3.5 hover:shadow-md hover:border-indigo-300 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            row.status === "paid" 
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
                              : "bg-gradient-to-br from-amber-400 to-amber-600"
                          }`}>
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{row.name}</span>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
                          row.status === "paid"
                            ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                            : "bg-amber-100 text-amber-700 border-2 border-amber-300"
                        }`}>
                          {row.status === "paid" ? "✓ Paid" : "⏱ Unpaid"}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Empty State */}
                {paymentSummary.rows.filter(row => {
                  const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFilter = filterStatus === "all" || row.status === filterStatus;
                  return matchesSearch && matchesFilter;
                }).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-slate-600 font-semibold">No attendees found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
                  </div>
                )}

                {/* Recent Updates */}
                {paymentNotifications.length > 0 && filterStatus === "all" && !searchQuery && (
                  <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-indigo-900">Recent Payment Updates</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {paymentNotifications.slice(0, 5).map((notice) => {
                        const shortId = notice.userId ? notice.userId.slice(0, 6) : "user";
                        return (
                          <div key={`${notice.userId}-${notice.timestamp}`} className="text-xs text-indigo-700 bg-white/60 rounded-lg px-3 py-2">
                            <span className="font-semibold">User {shortId}</span> marked as{" "}
                            <span className={`font-bold ${
                              notice.status === "paid" ? "text-emerald-700" : "text-amber-700"
                            }`}>
                              {notice.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

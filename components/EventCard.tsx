"use client";

import { useState, useEffect } from "react";
import { getCategoryTheme, getAudioForCategory } from "@/constants/categoryThemes";
import { X } from "lucide-react";

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
  const [opened, setOpened] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
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
  };

  const handlePrimaryAction = () => {
    if (!isLoggedIn) return;
    if (isOrganizer) return;
    if (isUserAttending) {
      if (onLeave && event._id) onLeave(event._id);
      return;
    }
    if (isFull) return;
    if (onJoin && event._id) onJoin(event._id);
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
              <span className="flex items-center gap-1">
                Start: {formatDate(event.startDate)}
              </span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br ${theme.bgGradient} rounded-3xl shadow-2xl border-4 ${theme.borderColor} animate-scale-in`}
      >
        {/* Decorative Top Border */}
        <div className={`h-3 w-full bg-gradient-to-r ${theme.topBarGradient} animate-shimmer`}></div>

        {/* Close Button */}
        <button
          onClick={handleCloseEnvelope}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:rotate-90"
          title="Close envelope"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Music Control Button */}
        <button
          onClick={toggleMusic}
          className={`absolute top-6 left-6 z-10 px-4 py-2 rounded-full font-semibold text-sm shadow-lg transition-all duration-200 hover:scale-105 ${
            isPlayingMusic
              ? `bg-gradient-to-r ${theme.topBarGradient} text-white`
              : `bg-white/90 ${theme.textColor} border-2 ${theme.borderColor}`
          }`}
          title={isPlayingMusic ? "Stop music" : "Play music"}
        >
          {isPlayingMusic ? "🎵 Playing" : "🔊 Play Music"}
        </button>

        {/* Opened Card Content */}
        <div className="p-8 pt-20">
          {/* Header with Icon and Title */}
          <div className="flex items-start gap-6 mb-6">
            <div className={`flex-shrink-0 w-20 h-20 rounded-2xl ${theme.iconBg} flex items-center justify-center text-4xl shadow-lg border-2 ${theme.borderColor}`}>
              {theme.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-2xl font-bold text-gray-900">
                  {event.title}
                </h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${theme.badgeBg} ${theme.badgeText} border-2 ${theme.borderColor}`}>
                  {event.isPublic ? "Public" : "Private"}
                </span>
              </div>
              <p className={`text-sm font-bold ${theme.textColor} mb-2`}>{theme.name}</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${theme.badgeBg} border-2 ${theme.borderColor}`}>
                <span className="text-gray-600 text-sm font-semibold">Organized by:</span>
                <span className={`font-bold ${theme.textColor}`}>
                  {event.organizer?.firstName} {event.organizer?.lastName}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`mb-6 p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor}`}>
            <p className={`text-xs font-bold ${theme.textColor} mb-2`}>📝 About this event</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Info Grid - Enhanced */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📅</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Start Date</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{formatDate(event.startDate)}</p>
            </div>
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Capacity</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{event.capacity ?? "Unlimited"}</p>
            </div>
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📍</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Location</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{event.location}</p>
            </div>
            <div className={`p-4 rounded-xl ${theme.badgeBg} border-2 ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <p className={`text-xs font-bold ${theme.textColor}`}>Status</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 capitalize">{event.status || "Active"}</p>
            </div>
          </div>

          {/* Badges Row - Enhanced */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Ticket Price Badge */}
            {event.ticketPrice && event.ticketPrice > 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-xl font-bold text-sm border-2 border-yellow-300 shadow-md">
                💰 ${event.ticketPrice}
              </div>
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
  );
};

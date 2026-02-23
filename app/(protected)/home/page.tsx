"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getProfile } from "@/lib/api/auth";
import { getEvents, joinEvent, leaveEvent } from "@/lib/api/events";
import { EventCard } from "@/components/EventCard";
import { MOCK_EVENTS } from "@/constants/mockEvents";
import { getCategoryTheme } from "@/constants/categoryThemes";
import {
  FaBirthdayCake,
  FaCalendarAlt,
  FaClock,
  FaDonate,
  FaGem,
  FaGraduationCap,
  FaHeart,
  FaMicrophone,
  FaPlus,
  FaRing,
  FaTools
} from "react-icons/fa";

interface Event {
  _id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
  status?: string;
  capacity?: number;
  attendees?: Array<any>;
  organizer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
  isPublic?: boolean;
  budgetBreakdown?: {
    [category: string]: number;
  };
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchPublicEvents = useCallback(async () => {
    try {
      // Combine mock events with API events
      try {
        const response = await getEvents({
          isPublic: true,
          status: ["approved", "published"]
        });
        const apiEvents = response.data || [];
        const normalized = apiEvents.map((event: any) => {
          if (typeof event.organizer === "string") {
            return { ...event, organizer: { _id: event.organizer } };
          }
          return event;
        });
        // Combine mock events with API events for demo purposes
        setEvents([...MOCK_EVENTS, ...normalized]);
      } catch (apiError) {
        // If API fails, use mock events for demo
        setEvents(MOCK_EVENTS);
      }
    } catch (error) {
      console.error("Error fetching public events:", error);
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProfilePicture = async () => {
      try {
        const response = await getProfile();
        const userId = response?.data?._id;
        if (isMounted) {
          setCurrentUserId(userId);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
    fetchPublicEvents();

    return () => {
      isMounted = false;
    };
  }, [fetchPublicEvents]);

  const handleJoinEvent = useCallback(
    async (eventId: string) => {
      try {
        await joinEvent(eventId);
        await fetchPublicEvents();
      } catch (error: any) {
        alert(error.message || "Failed to join event");
      }
    },
    [fetchPublicEvents]
  );

  const handleLeaveEvent = useCallback(
    async (eventId: string) => {
      try {
        await leaveEvent(eventId);
        await fetchPublicEvents();
      } catch (error: any) {
        alert(error.message || "Failed to leave event");
      }
    },
    [fetchPublicEvents]
  );

  const getEventUserFlags = (event: Event) => {
    const organizerId = event.organizer?._id;
    const isOrganizer = organizerId && currentUserId && String(organizerId) === String(currentUserId);
    const isUserAttending = Array.isArray(event.attendees)
      ? event.attendees.some((att: any) => {
          if (typeof att === "string") return att === currentUserId;
          if (att && att._id) return String(att._id) === String(currentUserId);
          return false;
        })
      : false;
    return { isOrganizer: !!isOrganizer, isUserAttending };
  };

  const filteredEvents = events.filter((event) => {
    if (!event.startDate) return false;
    const now = new Date();
    const eventDate = new Date(event.startDate);
    const { isOrganizer } = getEventUserFlags(event);
    if (activeTab === "upcoming") return eventDate >= now && !isOrganizer;
    if (activeTab === "past") return eventDate < now && !isOrganizer;
    return !isOrganizer;
  });

  const eventCategories = [
    {
      name: "Birthday",
      key: "birthday",
      icon: FaBirthdayCake,
    },
    {
      name: "Anniversary",
      key: "anniversary",
      icon: FaHeart,
    },
    {
      name: "Wedding",
      key: "wedding",
      icon: FaRing,
    },
    {
      name: "Engagement",
      key: "engagement",
      icon: FaGem,
    },
    {
      name: "Workshop",
      key: "workshop",
      icon: FaTools,
    },
    {
      name: "Conference",
      key: "conference",
      icon: FaMicrophone,
    },
    {
      name: "Graduation",
      key: "graduation",
      icon: FaGraduationCap,
    },
    {
      name: "Fundraisers",
      key: "fundraisers",
      icon: FaDonate,
    }
  ];

  return (
    <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 px-6 py-16 mb-8 relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse animation-delay-2000"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
            <div className="flex-1">
              <div className="mb-4 inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                <p className="text-sm font-semibold text-white">✨ Welcome to Evently</p>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">Discover & Create<br />Amazing Events</h1>
              <p className="text-lg text-white/95 mb-8 max-w-lg leading-relaxed">Plan unforgettable moments with our powerful event management platform. Connect with communities and make events that matter.</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-white/95 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 group"
                >
                  <FaPlus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Create Event
                </Link>
                <Link
                  href="#browse"
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/15 transition-all duration-300 backdrop-blur-sm group"
                >
                  <FaCalendarAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Browse Events
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaCalendarAlt className="w-48 h-48 text-white/20 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Create Section */}
      <section className="w-full h-full px-6 pb-8" id="browse">
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-indigo-200 shadow-lg">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Quick Start - Choose Category</h2>
          <p className="text-gray-600 mb-8 text-lg">Select a category to begin creating your event</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {eventCategories.map((category, index) => {
              const theme = getCategoryTheme(category.key);
              return (
                <Link
                  key={category.name}
                  href={`/create-event?category=${category.name.toLowerCase()}`}
                  className={`bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor} rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-115 cursor-pointer group animate-card-slide-in ${theme.animationDelay}`}
                >
                  <div className="text-5xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 animate-shimmer">
                    {theme.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-800 text-center leading-tight group-hover:text-lg transition-all">{theme.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full h-full px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 backdrop-blur-sm bg-white/95">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
            <nav className="flex">
              {[
                { id: "upcoming", label: "Upcoming Events", icon: FaCalendarAlt },
                { id: "past", label: "Past Events", icon: FaClock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "upcoming" | "past")}
                  className={`flex items-center gap-2 px-8 py-4 text-sm font-bold border-b-3 transition-all duration-300 group ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600 bg-white shadow-sm"
                      : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-white/50 group-hover:border-indigo-200"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 transition-all ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Events Content */}
          <div className="p-8 bg-gradient-to-b from-white to-gray-50/50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCalendarAlt className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {activeTab === "upcoming" && "No upcoming events"}
                  {activeTab === "past" && "No past events"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {activeTab === "upcoming" && "No upcoming events yet. Be the first to create one!"}
                  {activeTab === "past" && "Past events will appear here once they conclude."}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    href="/create-event"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaPlus className="w-5 h-5" />
                    Create Your First Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                {filteredEvents.map((event) => {
                  const { isOrganizer, isUserAttending } = getEventUserFlags(event);
                  return (
                    <EventCard
                      key={event._id}
                      event={event}
                      onJoin={handleJoinEvent}
                      onLeave={handleLeaveEvent}
                      isLoggedIn={isLoggedIn}
                      isOrganizer={isOrganizer}
                      isUserAttending={isUserAttending}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

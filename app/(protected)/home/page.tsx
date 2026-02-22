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
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-12 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">Welcome to Evently</h1>
              <p className="text-lg text-white/90 mb-6">Discover, create, and manage amazing events in your community</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlus className="w-5 h-5" />
                  Create Event
                </Link>
                <Link
                  href="#browse"
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all duration-200"
                >
                  <FaCalendarAlt className="w-5 h-5" />
                  Browse Events
                </Link>
              </div>
            </div>
            <div className="hidden lg:block text-white/20 text-6xl">
              <FaCalendarAlt className="w-40 h-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Create Section */}
      <section className="w-full h-full px-6 pb-8" id="browse">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Start - Choose Category</h2>
          <p className="text-gray-600 mb-6">Start creating your event by selecting a category</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {eventCategories.map((category, index) => {
              const theme = getCategoryTheme(category.key);
              return (
                <Link
                  key={category.name}
                  href={`/create-event?category=${category.name.toLowerCase()}`}
                  className={`bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor} rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer group animate-card-slide-in ${theme.animationDelay}`}
                >
                  <div className="text-3xl group-hover:scale-125 transition-transform duration-200 animate-shimmer">
                    {theme.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{theme.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full h-full px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              {[
                { id: "upcoming", label: "Upcoming Events", icon: FaCalendarAlt },
                { id: "past", label: "Past Events", icon: FaClock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "upcoming" | "past")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600 bg-white"
                      : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Events Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "upcoming" && "No upcoming events"}
                  {activeTab === "past" && "No past events"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "upcoming" && "Check back later for new public events!"}
                  {activeTab === "past" && "Past public events will appear here."}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    href="/create-event"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create an Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
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

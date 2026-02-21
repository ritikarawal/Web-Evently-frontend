"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getProfile } from "@/lib/api/auth";
import { getEvents, joinEvent, leaveEvent } from "@/lib/api/events";
import { EventCard } from "@/components/EventCard";
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
      const response = await getEvents({
        isPublic: true,
        status: ["approved", "published"]
      });
      const fetchedEvents = response.data || [];
      const normalized = fetchedEvents.map((event: any) => {
        if (typeof event.organizer === "string") {
          return { ...event, organizer: { _id: event.organizer } };
        }
        return event;
      });
      setEvents(normalized);
    } catch (error) {
      console.error("Error fetching public events:", error);
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
      icon: FaBirthdayCake,
      iconColor: "text-pink-500",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      hoverColor: "hover:from-pink-100 hover:to-rose-100",
      borderColor: "border-pink-200"
    },
    {
      name: "Anniversary",
      icon: FaHeart,
      iconColor: "text-red-500",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      hoverColor: "hover:from-red-100 hover:to-pink-100",
      borderColor: "border-red-200"
    },
    {
      name: "Wedding",
      icon: FaRing,
      iconColor: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      hoverColor: "hover:from-purple-100 hover:to-indigo-100",
      borderColor: "border-purple-200"
    },
    {
      name: "Engagement",
      icon: FaGem,
      iconColor: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      hoverColor: "hover:from-blue-100 hover:to-cyan-100",
      borderColor: "border-blue-200"
    },
    {
      name: "Workshop",
      icon: FaTools,
      iconColor: "text-green-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      hoverColor: "hover:from-green-100 hover:to-emerald-100",
      borderColor: "border-green-200"
    },
    {
      name: "Conference",
      icon: FaMicrophone,
      iconColor: "text-indigo-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      hoverColor: "hover:from-indigo-100 hover:to-purple-100",
      borderColor: "border-indigo-200"
    },
    {
      name: "Graduation",
      icon: FaGraduationCap,
      iconColor: "text-yellow-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      hoverColor: "hover:from-yellow-100 hover:to-orange-100",
      borderColor: "border-yellow-200"
    },
    {
      name: "Fundraisers",
      icon: FaDonate,
      iconColor: "text-orange-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      hoverColor: "hover:from-orange-100 hover:to-red-100",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <main className="flex-1">
      {/* Dashboard Header */}
      <section className="w-full h-full px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
            <p className="text-gray-600">Find and join amazing public events in your area</p>
          </div>
          <Link
            href="/create-event"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus className="w-5 h-5" />
            Create New Event
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full h-full px-6 pb-16">
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: "upcoming", label: "Upcoming Events", icon: FaCalendarAlt },
                { id: "past", label: "Past Events", icon: FaClock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "upcoming" | "past")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Quick Create Section */}
      <section className="w-full h-full px-6 pb-16">
        <div className="bg-white/70 backdrop-blur-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Create</h2>
            <p className="text-gray-600">Choose an event type to get started quickly</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {eventCategories.map((category) => (
              <div key={category.name} className="relative group">
                <Link
                  href={`/create-event?category=${category.name.toLowerCase()}`}
                  className={`${category.bgColor} ${category.hoverColor} ${category.borderColor} border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group cursor-pointer`}
                >
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    <category.icon className={category.iconColor} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{category.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

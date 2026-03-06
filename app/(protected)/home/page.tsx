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

// Accept sidebarOpen as a prop (default true for demo)
export default function HomePage({ sidebarOpen = true }: { sidebarOpen?: boolean }) {

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string>("");

    // Define fetchPublicEvents before any useEffect
    const fetchPublicEvents = useCallback(async () => {
      try {
        const response = await getEvents({
          isPublic: true,
          status: ["approved", "published"]
        });
        const apiEvents = (response as any)?.data || [];
        const normalized = apiEvents.map((event: any) => {
          if (typeof event.organizer === "string") {
            return { ...event, organizer: { _id: event.organizer } };
          }
          return event;
        });
        // Combine mock events with API events for demo purposes
        setEvents([...MOCK_EVENTS, ...normalized]);
      } catch (error) {
        // If API fails, use mock events for demo
        console.error("Error fetching public events:", error);
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    }, []);

    // Fetch events on mount
    useEffect(() => {
      fetchPublicEvents();
    }, [fetchPublicEvents]);

    // Fetch user profile and set userName
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await getProfile();
          console.log('[HomePage] getProfile response:', response);
          const data = response?.data || response;
          const firstName = data?.firstName;
          const lastName = data?.lastName;
          const username = data?.username;
          setUserName(firstName || username || '');
          if (data?._id) setCurrentUserId(data._id);
        } catch (err) {
          console.error('[HomePage] Failed to fetch profile:', err);
        }
      };
      fetchProfile();
    }, []);

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

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Adjust this value to match your navigation bar height (e.g., 64px or 4rem)
  const NAVBAR_HEIGHT = '4rem';
  // Sidebar open/close state is now a prop
  // Sidebar width: open = 240px, collapsed = 80px
  const sidebarWidth = sidebarOpen ? 240 : 80;
  // Dynamic margin for Quick Start section based on sidebar state
  const quickStartMarginTop = sidebarOpen ? 'mt-16' : 'mt-8';
  return (
    <div className="w-screen h-screen fixed top-0 left-0 m-0 p-0">
      <div style={{ background: 'var(--background)', minHeight: '100vh', width: '100%' }}>
        <div
          className={`transition-all duration-300 pt-[${NAVBAR_HEIGHT}]`}
          style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
        >
          {/* Main content starts here, margin only on content */}
          {/* Place your greeting, create event button, quick create, and events content here as before */}
          {/* Quick Create Section with Greeting */}
          <div className={`mb-10 ${quickStartMarginTop}`}>
            <div className="mb-2">
              <span className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>
                {getGreeting()}, {userName ? userName : 'User'}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Quick Start - Choose Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {eventCategories.map((category, index) => {
                const theme = getCategoryTheme(category.key);
                return (
                  <Link
                    key={category.name}
                    href={`/create-event?category=${category.name.toLowerCase()}`}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border p-4 shadow hover:shadow-lg transition group cursor-pointer"
                    style={{ borderColor: 'var(--primary-light)' }}
                  >
                    <span className="text-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">{theme.icon}</span>
                    <span className="text-sm font-semibold text-center" style={{ color: 'var(--primary)' }}>{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Events Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-700">Loading events...</p>
            </div>
          ) : (
            <div className="mb-10">
              <div className="flex gap-4 mb-6">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${activeTab === 'upcoming' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming Events
                </button>
                <button
                  className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${activeTab === 'past' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
                  onClick={() => setActiveTab('past')}
                >
                  Past Events
                </button>
              </div>
              {activeTab === 'upcoming' ? (
                <>
                  <h2 className="text-xl font-bold mb-4" style={{ color: '#1a202c' }}>Upcoming Events</h2>
                  {filteredEvents.filter(event => {
                    const now = new Date();
                    const eventDate = new Date(event.startDate || '');
                    const { isOrganizer } = getEventUserFlags(event);
                    return eventDate >= now && !isOrganizer;
                  }).length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No upcoming events yet.</div>
                  ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-4 xl:grid-cols-5'} gap-6`}>
                      {filteredEvents.filter(event => {
                        const now = new Date();
                        const eventDate = new Date(event.startDate || '');
                        const { isOrganizer } = getEventUserFlags(event);
                        return eventDate >= now && !isOrganizer;
                      }).map(event => {
                        const { isOrganizer, isUserAttending } = getEventUserFlags(event);
                        function handleJoinEvent(id: string): void { throw new Error("Function not implemented."); }
                        function handleLeaveEvent(id: string): void { throw new Error("Function not implemented."); }
                        return (
                          <div className="w-full max-w-sm mx-auto" key={event._id}>
                            <EventCard
                              event={event}
                              onJoin={handleJoinEvent}
                              onLeave={handleLeaveEvent}
                              isLoggedIn={isLoggedIn}
                              isOrganizer={isOrganizer}
                              isUserAttending={isUserAttending}
                              currentUserId={currentUserId}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4" style={{ color: '#1a202c' }}>Past Events</h2>
                  {filteredEvents.filter(event => {
                    const now = new Date();
                    const eventDate = new Date(event.startDate || '');
                    const { isOrganizer } = getEventUserFlags(event);
                    return eventDate < now && !isOrganizer;
                  }).length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No past events yet.</div>
                  ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-4 xl:grid-cols-5'} gap-6`}>
                      {filteredEvents.filter(event => {
                        const now = new Date();
                        const eventDate = new Date(event.startDate || '');
                        const { isOrganizer } = getEventUserFlags(event);
                        return eventDate < now && !isOrganizer;
                      }).map(event => {
                        const { isOrganizer, isUserAttending } = getEventUserFlags(event);
                        function handleJoinEvent(id: string): void { throw new Error("Function not implemented."); }
                        function handleLeaveEvent(id: string): void { throw new Error("Function not implemented."); }
                        return (
                          <div className="w-full max-w-sm mx-auto" key={event._id}>
                            <EventCard
                              event={event}
                              onJoin={handleJoinEvent}
                              onLeave={handleLeaveEvent}
                              isLoggedIn={isLoggedIn}
                              isOrganizer={isOrganizer}
                              isUserAttending={isUserAttending}
                              currentUserId={currentUserId}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


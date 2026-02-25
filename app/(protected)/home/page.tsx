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
        const apiEvents = (response as any)?.data || [];
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
    <main
      className="flex-1 min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--primary-light)]"
      style={{ color: 'var(--foreground)', padding: '2rem 0' }}
    >
      {/* Hero Section */}
      <section
        className="w-full max-w-7xl mx-auto px-8 py-16 mb-12 relative overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 80%, var(--primary-light) 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        {/* Animated background circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse animation-delay-2000"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
            <div className="flex-1">
              <div
                className="mb-6 inline-block px-6 py-3 rounded-full border backdrop-blur-md shadow-lg"
                style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'var(--primary-light)' }}
              >
                <p className="text-base font-semibold tracking-wide" style={{ color: 'var(--primary)' }}>✨ Welcome to Evently</p>
              </div>
              <h1 className="text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg" style={{ color: 'var(--nav-selected)', textShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
                Discover & Create<br />Amazing Events
              </h1>
              <p className="text-xl mb-10 max-w-xl leading-relaxed" style={{ color: 'var(--nav-selected)', opacity: 0.95 }}>
                Plan unforgettable moments with our powerful event management platform. Connect with communities and make events that matter.
              </p>
              <div className="flex flex-wrap gap-6 mt-6">
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(90deg, var(--nav-selected) 80%, var(--primary-light) 100%)',
                    color: 'var(--primary)',
                    boxShadow: '0 4px 24px 0 rgba(127,15,35,0.12)'
                  }}
                >
                  <FaPlus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  Create Event
                </Link>
                <Link
                  href="#browse"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg border-2 hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-md group"
                  style={{
                    borderColor: 'var(--nav-selected)',
                    color: 'var(--nav-selected)',
                    background: 'rgba(255,255,255,0.10)'
                  }}
                >
                  <FaCalendarAlt className="w-6 h-6 group-hover:scale-110 transition-transform" />
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
        <div
          className="rounded-3xl p-10 border shadow-2xl backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.75)',
            borderColor: 'var(--primary-light)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'
          }}
        >
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--primary)' }}>Quick Start - Choose Category</h2>
          <p className="mb-10 text-lg" style={{ color: 'var(--text-secondary)' }}>Select a category to begin creating your event</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {eventCategories.map((category, index) => {
              const theme = getCategoryTheme(category.key);
              return (
                <Link
                  key={category.name}
                  href={`/create-event?category=${category.name.toLowerCase()}`}
                  className={`rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group animate-card-slide-in ${theme.animationDelay}`}
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    border: `2px solid var(--primary-light)`
                  }}
                >
                  <div className="text-5xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 animate-shimmer">
                    {theme.icon}
                  </div>
                  <span className="text-base font-bold text-center leading-tight group-hover:text-lg transition-all" style={{ color: 'var(--primary)' }}>{theme.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full h-full px-6 pb-16">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden border backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.85)',
            borderColor: 'var(--border)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)'
          }}
        >
          {/* Tabs */}
          <div
            className="border-b flex justify-center gap-2 py-2 bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          >
            <nav className="flex">
              {[
                { id: "upcoming", label: "Upcoming Events", icon: FaCalendarAlt },
                { id: "past", label: "Past Events", icon: FaClock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "upcoming" | "past")}
                  className={`flex items-center gap-2 px-8 py-3 text-base font-bold rounded-full transition-all duration-300 group shadow-sm mx-2 ${activeTab === tab.id ? 'bg-[var(--primary)] text-[var(--nav-selected)]' : 'bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--nav-selected)]'}`}
                  style={{ border: 'none', outline: 'none', boxShadow: activeTab === tab.id ? '0 2px 12px 0 rgba(127,15,35,0.10)' : undefined }}
                >
                  <tab.icon className={`w-5 h-5 transition-all ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Events Content */}
          <div className="p-10" style={{ background: 'rgba(255,255,255,0.95)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'var(--primary)' }}></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md" style={{ background: 'var(--primary-light)' }}>
                  <FaCalendarAlt className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: 'var(--primary)' }}>
                  {activeTab === "upcoming" && "No upcoming events"}
                  {activeTab === "past" && "No past events"}
                </h3>
                <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {activeTab === "upcoming" && "No upcoming events yet. Be the first to create one!"}
                  {activeTab === "past" && "Past events will appear here once they conclude."}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    href="/create-event"
                    className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
                    style={{ background: 'linear-gradient(90deg, var(--primary) 80%, var(--primary-light) 100%)', color: 'var(--nav-selected)' }}
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
                      currentUserId={currentUserId}
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

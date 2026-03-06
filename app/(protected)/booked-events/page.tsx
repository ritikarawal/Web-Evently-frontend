"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { getEvents, getUserEvents, leaveEvent } from "@/lib/api/events";
import { getProfile } from "@/lib/api/auth";

export default function BookedEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [joinedEventsApi, setJoinedEventsApi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const refreshUserEvents = async () => {
    const response = await getUserEvents();
    if (response.success === false) {
      setError(response.message || "Failed to fetch your events");
      return;
    }
    const data = response.data || [];
    if (Array.isArray(data)) {
      setEvents(data);
      setJoinedEventsApi([]);
    } else {
      setEvents(data.events || []);
      setJoinedEventsApi(data.joinedEvents || []);
    }
  };

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        await refreshUserEvents();
      } catch (err: any) {
        setError(err.message || "Failed to fetch your events");
      } finally {
        setLoading(false);
      }
    };
    fetchUserEvents();
  }, []);

  useEffect(() => {
    const fetchFallbackEvents = async () => {
      if (!currentUserId || joinedEventsApi.length > 0 || events.length > 0) return;
      try {
        const response = await getEvents();
        if (response.success) {
          setEvents(response.data || []);
        }
      } catch (err: any) {
        // ignore
      }
    };
    fetchFallbackEvents();
  }, [currentUserId, joinedEventsApi.length, events.length]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        const userId = profile?.data?._id ?? profile?._id ?? null;
        setCurrentUserId(userId);
      } catch (err: any) {
        // ignore
      }
    };
    fetchProfile();
  }, []);

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
      await refreshUserEvents();
    } catch (err: any) {
      setError(err.message || "Failed to leave event");
    }
  };

  const getOrganizerId = (event: any) => {
    if (!event) return null;
    return event.organizer?._id ?? event.organizer ?? null;
  };

  const isOrganizerEvent = (event: any) => {
    const organizerId = getOrganizerId(event);
    if (!organizerId || !currentUserId) return false;
    return String(organizerId) === String(currentUserId);
  };

  const isJoinedEvent = (event: any) => {
    if (!currentUserId || !Array.isArray(event?.attendees)) return false;
    return event.attendees.some((att: any) => {
      if (typeof att === "string") return String(att) === String(currentUserId);
      if (att && att._id) return String(att._id) === String(currentUserId);
      return false;
    });
  };

  const bookedEvents = joinedEventsApi.length > 0
    ? joinedEventsApi
    : events.filter((event) => isJoinedEvent(event) && !isOrganizerEvent(event));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Booked Events</h1>
          <p className="text-sm text-gray-600 mt-1">Events you have joined or booked</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/my-events"
            className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Created Events
          </Link>
          <Link
            href="/events"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-700">Loading your events...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      ) : bookedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You have not booked or joined any events yet.</p>
          <Link
            href="/events"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              showActions={true}
              currentUserId={currentUserId || undefined}
              isLoggedIn={true}
              isOrganizer={isOrganizerEvent(event)}
              isUserAttending={isJoinedEvent(event)}
              onLeave={handleLeaveEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

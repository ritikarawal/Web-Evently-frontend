"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { deleteEvent, getEvents, getUserEvents } from "@/lib/api/events";
import { getProfile } from "@/lib/api/auth";

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        const userId = profile?.data?._id ?? profile?._id ?? null;
        setCurrentUserId(userId);
      } catch (err: any) {
        setCurrentUserId(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const getOrganizerId = (event: any) => {
    if (!event) return null;
    return event.organizer?._id ?? event.organizer ?? null;
  };

  const isOrganizerEvent = (event: any) => {
    const organizerId = getOrganizerId(event);
    if (!organizerId || !currentUserId) return false;
    return String(organizerId) === String(currentUserId);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        setError(null);

        let dataEvents: any[] = [];

        try {
          const response = await getUserEvents();
          if (response.success === false) {
            setError(response.message || "Failed to fetch your events");
          } else {
            const data = response.data || [];
            if (Array.isArray(data)) {
              dataEvents = data;
            } else {
              dataEvents = data.events || data.createdEvents || [];
            }
          }
        } catch {
          // ignore and fall back to all events
        }

        if (dataEvents.length === 0) {
          const response = await getEvents();
          if (response.success) {
            dataEvents = response.data || [];
          }
        }

        setEvents(dataEvents);
      } catch (err: any) {
        setError(err.message || "Failed to fetch your events");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setCreatedEvents([]);
      return;
    }
    const created = events.filter((event) => isOrganizerEvent(event));
    setCreatedEvents(created);
  }, [events, currentUserId]);

  const isJoinedEvent = (event: any) => {
    if (!currentUserId || !Array.isArray(event?.attendees)) return false;
    return event.attendees.some((att: any) => {
      if (typeof att === "string") return String(att) === String(currentUserId);
      if (att && att._id) return String(att._id) === String(currentUserId);
      return false;
    });
  };

  const handleEdit = (event: any) => {
    localStorage.setItem("editEvent", JSON.stringify(event));
    router.push("/create-event");
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setCreatedEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Created Events</h1>
          <p className="text-sm text-gray-600 mt-1">Events you have created as organizer</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/booked-events"
            className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Booked Events
          </Link>
          <Link
            href="/create-event"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </Link>
        </div>
      </div>
      {loadingEvents || loadingProfile ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-700">Loading your events...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      ) : createdEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
          <Link
            href="/create-event"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {createdEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={currentUserId || undefined}
              isLoggedIn={true}
              isOrganizer={isOrganizerEvent(event)}
              isUserAttending={isJoinedEvent(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
  }
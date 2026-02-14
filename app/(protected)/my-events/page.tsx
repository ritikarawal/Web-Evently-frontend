"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavigationBar from "@/components/NavigationBar";
import EventCard from "@/components/EventCard";
import { getUserEvents, deleteEvent, leaveEvent, respondToBudgetProposal } from "@/lib/api/events";
import { getProfile } from "@/lib/api/auth";

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        const response = await getUserEvents();
        if (response.success) {
          setEvents(response.data || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch your events");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();

    // Get profile picture from cookie
    const getCookieValue = (name: string) => {
      if (typeof document === "undefined") return null;
      const nameEQ = `${name}=`;
      const cookies = document.cookie.split(";");
      for (const rawCookie of cookies) {
        const cookie = rawCookie.trim();
        if (cookie.startsWith(nameEQ)) {
          const value = cookie.substring(nameEQ.length);
          try {
            return decodeURIComponent(value);
          } catch {
            return value;
          }
        }
      }
      return null;
    };

    const userDataRaw = getCookieValue("user_data");
    if (userDataRaw) {
      try {
        const parsed = JSON.parse(userDataRaw) as { profilePicture?: string };
        if (parsed?.profilePicture) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
          setProfilePicture(`${baseUrl}${parsed.profilePicture}`);
        }
      } catch {
        // ignore invalid cookie payload
      }
    }

    // Fetch profile to get role
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profilePic = response?.data?.profilePicture;
        const userRole = response?.data?.role;
        const userId = response?.data?._id;
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const resolvedUrl = profilePic ? `${baseUrl}${profilePic}` : null;
        setProfilePicture(resolvedUrl);
        setIsAdmin(userRole === 'admin');
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = (event: any) => {
    // Store event data in localStorage for editing
    localStorage.setItem('editEvent', JSON.stringify(event));
    router.push('/create-event');
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      // Refresh the events list
      const response = await getUserEvents();
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    }
  };

  const handleLeave = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
      // Refresh the events list
      const response = await getUserEvents();
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to leave event");
    }
  };

  const handleBudgetResponse = async (eventId: string, accepted: boolean, counterProposal?: number, message?: string) => {
    try {
      await respondToBudgetProposal(eventId, { accepted, counterProposal, message });
      // Refresh the events list
      const response = await getUserEvents();
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to respond to budget proposal");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <NavigationBar profilePicture={profilePicture} isAdmin={isAdmin} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
          <Link
            href="/create-event"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-700">Loading your events...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-600">{error}</p>
          </div>
        ) : events.length === 0 ? (
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
            {events.map((event) => {
              const isOrganizer = currentUserId ? event.organizer?._id === currentUserId : false;
              return (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onLeave={handleLeave}
                  onBudgetResponse={handleBudgetResponse}
                  currentUserId={currentUserId || undefined}
                  isLoggedIn={true}
                  isOrganizer={isOrganizer}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { getUserEvents, leaveEvent, respondToBudgetProposal } from "@/lib/api/events";
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
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setProfilePicture(profile.profilePicture || null);
        setIsAdmin(profile.isAdmin || false);
        setCurrentUserId(profile._id || null);
      } catch (err: any) {
        // ignore
      }
    };
    fetchProfile();
  }, []);

  // Handler functions
  const handleEdit = () => {};
  const handleDelete = () => {};
  const handleLeave = () => {};
  const handleBudgetResponse = () => {};

  return (
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
          {events.map((event) => (
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
              isOrganizer={false}
            />
          ))}
        </div>
      )}
    </div>
  );
  }
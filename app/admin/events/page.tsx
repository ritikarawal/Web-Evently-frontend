"use client";
import { useEffect, useState } from "react";

import { getAllEvents, approveEvent, declineEvent, deleteEvent } from "@/lib/api/adminEvents";
import { DeleteIcon } from "@/components/AdminIcon";

export default function AdminEventsPage() {

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // eventId for which action is loading
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
         const data: any = await getAllEvents();
         setEvents(
           Array.isArray(data)
             ? data
             : (typeof data === 'object' && data !== null && (
                 ('events' in data ? data.events : ('data' in data ? data.data : []))
               )) || []
         );
      } catch (err: any) {
        setError(err?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Action handlers
  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);
    setActionError(null);
    try {
      await approveEvent(eventId);
      setEvents(events => events.map(ev => ev._id === eventId ? { ...ev, status: "approved" } : ev));
    } catch (err: any) {
      setActionError(err?.message || "Failed to approve event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (eventId: string) => {
    setActionLoading(eventId);
    setActionError(null);
    try {
      await declineEvent(eventId);
      setEvents(events => events.map(ev => ev._id === eventId ? { ...ev, status: "declined" } : ev));
    } catch (err: any) {
      setActionError(err?.message || "Failed to decline event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setActionLoading(eventId);
    setActionError(null);
    try {
      await deleteEvent(eventId);
      setEvents(events => events.filter(ev => ev._id !== eventId));
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete event");
    } finally {
      setActionLoading(null);
    }
  };

  // Modern UI
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#800000] mb-4">Admin Events</h1>
      <div className="bg-white/80 rounded-2xl shadow-xl p-8 border border-gray-200">
        <h2 className="font-semibold text-lg text-gray-900 mb-4">Event List</h2>
        {loading ? (
          <div className="text-gray-700">Loading events...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : events.length === 0 ? (
          <div>No events found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Title</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Date</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Location</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 border-b border-gray-100 font-semibold">{event.title || event.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 border-b border-gray-100">{event.date ? new Date(event.date).toLocaleDateString() : (event.startDate ? new Date(event.startDate).toLocaleDateString() : "-")}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 border-b border-gray-100">{event.location || "-"}</td>
                    <td className="py-3 px-4 text-sm border-b border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        event.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : event.status === "declined"
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-amber-100 text-amber-700 border border-amber-300"
                      }`}>
                        {event.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm border-b border-gray-100 flex gap-2 items-center">
                      {event.status !== "approved" && (
                        <button
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full text-xs font-bold"
                          disabled={actionLoading === event._id}
                          onClick={() => handleApprove(event._id)}
                        >
                          {actionLoading === event._id ? "..." : "Approve"}
                        </button>
                      )}
                      {/* Show decline only if event is not approved and not already declined */}
                      {event.status !== "declined" && event.status !== "approved" && (
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full text-xs font-bold"
                          disabled={actionLoading === event._id}
                          onClick={() => handleDecline(event._id)}
                        >
                          {actionLoading === event._id ? "..." : "Decline"}
                        </button>
                      )}
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                        disabled={actionLoading === event._id}
                        onClick={() => handleDelete(event._id)}
                        title="Delete Event"
                      >
                        <DeleteIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

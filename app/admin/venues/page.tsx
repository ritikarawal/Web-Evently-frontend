"use client";
import { useEffect, useState } from "react";

import { getVenues } from "@/lib/api/venues";
import CreateVenueForm from "./CreateVenueForm";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVenues();
        setVenues(Array.isArray(data) ? data : data?.venues || []);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch venues");
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#800000] mb-4">Admin Venues</h1>
      <div className="bg-white/80 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-gray-900">Create Venue</h2>
          {!showCreate && (
            <button
              className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform"
              onClick={() => setShowCreate(true)}
            >
              + New Venue
            </button>
          )}
        </div>
        {showCreate && (
          <div className="mb-2">
            <CreateVenueForm
              onSuccess={() => {
                setShowCreate(false);
                // Refresh venues list
                setLoading(true);
                getVenues().then(data => {
                  setVenues(Array.isArray(data) ? data : data?.venues || []);
                  setLoading(false);
                });
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}
      </div>
      <div className="bg-white/80 rounded-2xl shadow-xl p-8 border border-gray-200">
        <h2 className="font-semibold text-lg text-gray-900 mb-4">Venue List</h2>
        {loading ? (
          <div>Loading venues...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : venues.length === 0 ? (
          <div>No venues found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">City</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {venues.map(venue => (
                  <tr key={venue.id || venue._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 border-b border-gray-100 font-semibold">{venue.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 border-b border-gray-100">{venue.city}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 border-b border-gray-100">{venue.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

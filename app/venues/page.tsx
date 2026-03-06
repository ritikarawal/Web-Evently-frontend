"use client";

import { useEffect, useState } from "react";
import * as venuesApi from "@/lib/api/venues";

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await venuesApi.getVenues();
        setVenues(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading venues...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Venues</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map((v: any) => (
          <div key={v._id} className="p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{v.name}</h3>
                <div className="text-sm text-gray-600">{v.city} • {v.capacity} capacity</div>
              </div>
              <div className="text-sm text-gray-500">{v.isActive ? 'Open' : 'Closed'}</div>
            </div>
            <p className="mt-3 text-sm text-gray-700">{v.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

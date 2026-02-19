"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import VenueForm from "@/components/VenueForm";
import * as venuesApi from "@/lib/api/venues";
import { useSearchParams } from "next/navigation";

export default function VenueAdminPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    load();
  }, []);

  // Open creation form automatically when URL contains ?create=1
  useEffect(() => {
    if (searchParams?.get && searchParams.get("create")) {
      setEditing(null);
      setShowForm(true);
    }
  }, [searchParams]);

  const load = async () => {
    const res = await venuesApi.getVenues();
    setVenues(res || []);
  };

  const handleSave = async (data: any) => {
    if (editing) {
      await venuesApi.updateVenue(editing._id, data);
    } else {
      await venuesApi.createVenue(data);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this venue?")) return;
    await venuesApi.deleteVenue(id);
    load();
  };

  const toggleActive = async (id: string) => {
    await venuesApi.toggleVenueStatus(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Venues</h2>
        <div className="flex gap-2">
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"><Plus className="w-4 h-4" /> New</button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-white">
          <VenueForm initial={editing || {}} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={handleSave} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map((v: any) => (
          <div key={v._id} className="p-4 border rounded-lg bg-white flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{v.name}</h3>
                <p className="text-sm text-gray-600">{v.city} — {v.capacity} capacity</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(v); setShowForm(true); }} className="px-3 py-1 bg-gray-100 rounded">Edit</button>
                <button onClick={() => toggleActive(v._id)} className="px-3 py-1 bg-gray-100 rounded">{v.isActive ? 'Disable' : 'Enable'}</button>
                <button onClick={() => handleDelete(v._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded">Delete</button>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700">{v.description}</p>
            <div className="mt-3 text-xs text-gray-500">Contact: {v.contactPerson} {v.contactEmail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import VenueForm from "@/components/VenueForm";
import { createVenue } from "@/lib/api/venues";

export default function VenueAdminPage() {
  const handleSave = async (data: any) => {
    await createVenue(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Create New Venue</h2>
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <VenueForm onCancel={() => {}} onSave={handleSave} />
      </div>
    </div>
  );
}
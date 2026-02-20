"use client";

import VenueForm from "@/components/VenueForm";

export default function VenueAdminPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Create New Venue</h2>
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <VenueForm onCancel={() => {}} onSave={() => {}} />
      </div>
    </div>
  );
}
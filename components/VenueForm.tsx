"use client";

import { useState } from "react";
import { Save, Trash, Plus } from "lucide-react";

interface VenueFormProps {
  initial?: any;
  onCancel?: () => void;
  onSave: (data: any) => void;
}

export default function VenueForm({ initial = {}, onCancel, onSave }: VenueFormProps) {
  const [form, setForm] = useState({
    name: initial.name || "",
    description: initial.description || "",
    address: initial.address || "",
    city: initial.city || "",
    state: initial.state || "",
    country: initial.country || "",
    capacity: initial.capacity || "",
    pricePerHour: initial.pricePerHour || "",
    pricePerDay: initial.pricePerDay || "",
    amenities: initial.amenities?.join(", ") || "",
    contactPerson: initial.contactPerson || "",
    contactEmail: initial.contactEmail || "",
    contactPhone: initial.contactPhone || "",
  });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e: any) => {
    e.preventDefault();
    const payload = {
      ...form,
      capacity: Number(form.capacity || 0),
      pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
      pricePerDay: form.pricePerDay ? Number(form.pricePerDay) : undefined,
      amenities: form.amenities ? form.amenities.split(",").map((s: string) => s.trim()) : [],
    };
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Venue name" className="p-3 border rounded-lg text-black placeholder-black" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="p-3 border rounded-lg text-black placeholder-black" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="p-3 border rounded-lg md:col-span-2 text-black placeholder-black" required />
        <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="p-3 border rounded-lg text-black placeholder-black" />
      </div>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="w-full p-3 border rounded-lg text-black placeholder-black" rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacity" className="p-3 border rounded-lg text-black placeholder-black" />
        <input name="pricePerHour" value={form.pricePerHour} onChange={handleChange} placeholder="Price / hour" className="p-3 border rounded-lg text-black placeholder-black" />
        <input name="pricePerDay" value={form.pricePerDay} onChange={handleChange} placeholder="Price / day" className="p-3 border rounded-lg text-black placeholder-black" />
      </div>
      <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Amenities (comma separated)" className="p-3 border rounded-lg text-black placeholder-black" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Contact person" className="p-3 border rounded-lg text-black placeholder-black" />
        <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="Contact email" className="p-3 border rounded-lg text-black placeholder-black" />
        <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Contact phone" className="p-3 border rounded-lg text-black placeholder-black" />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex items-center gap-2 hover:scale-[1.02] transition-transform"><Save className="w-4 h-4" /> Save</button>
      </div>
    </form>
  );
}

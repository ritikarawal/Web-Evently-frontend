"use client";

import { useState } from "react";
import { createVenue } from "@/lib/api/venues";
import { CATEGORY_THEMES } from "@/constants/categoryThemes";

export default function CreateVenueForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: "",
    city: "",
    capacity: "",
    address: "",
    description: "",
    recommendedCategory: "",
    pricePerHour: "",
    pricePerDay: "",
    country: "",
    state: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createVenue({
        ...form,
        capacity: Number(form.capacity),
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
        pricePerDay: form.pricePerDay ? Number(form.pricePerDay) : undefined,
        country: form.country,
        state: form.state,
        zipCode: form.zipCode,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to create venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-200 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-[#800000]">Create Venue</h2>
      <div className="grid grid-cols-1 gap-4">
        <select
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="recommendedCategory"
          value={form.recommendedCategory}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          {Object.entries(CATEGORY_THEMES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.name}
            </option>
          ))}
        </select>
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="name"
          placeholder="Venue Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="capacity"
          placeholder="Capacity"
          type="number"
          min={1}
          value={form.capacity}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="pricePerHour"
          placeholder="Price Per Hour (NPR)"
          type="number"
          min={0}
          value={form.pricePerHour}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="pricePerDay"
          placeholder="Price Per Day (NPR)"
          type="number"
          min={0}
          value={form.pricePerDay}
          onChange={handleChange}
          required
        />
        {/* Contact fields removed as per user request */}
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="zipCode"
          placeholder="Zip Code"
          value={form.zipCode}
          onChange={handleChange}
          required
        />
        <input
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <textarea
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none text-gray-900 bg-gray-50 min-h-[80px]"
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Venue"}
        </button>
        <button
          type="button"
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

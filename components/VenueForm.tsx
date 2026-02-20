"use client";

import { useState } from "react";
import { Save, Trash, Plus } from "lucide-react";
import { link } from "fs";

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
    recommendedCategory: initial.recommendedCategory || "",
  });
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validateStep = () => {
    if (step === 1) {
      return form.name && form.city && form.address;
    }
    if (step === 2) {
      return form.capacity && (form.pricePerHour || form.pricePerDay);
    }
    if (step === 3) {
      return form.contactPerson && form.contactEmail;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
    else setTouched({ ...touched, all: true });
  };
  const prevStep = () => setStep(step - 1);

  const submit = (e: any) => {
    e.preventDefault();
    if (!validateStep()) {
      setTouched({ ...touched, all: true });
      return;
    }
    const payload = {
      ...form,
      capacity: Number(form.capacity || 0),
      pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
      pricePerDay: form.pricePerDay ? Number(form.pricePerDay) : undefined,
      amenities: form.amenities ? form.amenities.split(",").map((s: string) => s.trim()) : [],
    };
    onSave(payload);
    setSuccess(true);
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
      <div className="flex justify-center mb-6">
        {[1,2,3].map((s) => (
          <div key={s} className={`flex-1 flex flex-col items-center ${step === s ? 'font-bold text-indigo-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${step === s ? 'border-indigo-700 bg-indigo-100' : 'border-gray-300 bg-gray-100'}`}>{s}</div>
            <div className="mt-2 text-xs">
              {s === 1 && 'Basic Info'}
              {s === 2 && 'Details & Pricing'}
              {s === 3 && 'Contact & Amenities'}
            </div>
          </div>
        ))}
      </div>

      {success ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-4 text-green-600">Venue Created!</div>
          <div className="text-gray-700 mb-6">Your venue has been successfully submitted.</div>
          <button type="button" onClick={() => window.location.href = '/admin/dashboard'} className="px-6 py-2 rounded-lg bg-indigo-600 text-white">Close</button>
        </div>
      ) : (
        <>
          {step === 1 && (
            <div className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Venue name" className="p-3 border rounded-lg w-full text-black placeholder-black" required autoFocus />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="p-3 border rounded-lg w-full text-black placeholder-black" required />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="p-3 border rounded-lg w-full text-black placeholder-black" required />
              <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="p-3 border rounded-lg w-full text-black placeholder-black" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="w-full p-3 border rounded-lg text-black placeholder-black" rows={3} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacity" className="p-3 border rounded-lg w-full text-black placeholder-black" required />
                <input name="pricePerHour" value={form.pricePerHour} onChange={handleChange} placeholder="Price / hour" className="p-3 border rounded-lg w-full text-black placeholder-black" />
                <input name="pricePerDay" value={form.pricePerDay} onChange={handleChange} placeholder="Price / day" className="p-3 border rounded-lg w-full text-black placeholder-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recommend Category (optional)</label>
                <select name="recommendedCategory" value={form.recommendedCategory} onChange={handleChange} className="w-full p-3 border rounded-lg text-black">
                  <option value="">None</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="graduation">Graduation</option>
                  <option value="fundraisers">Fundraisers</option>
                </select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Amenities (comma separated)" className="p-3 border rounded-lg w-full text-black placeholder-black" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Contact person" className="p-3 border rounded-lg w-full text-black placeholder-black" required />
                <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="Contact email" className="p-3 border rounded-lg w-full text-black placeholder-black" required />
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Contact phone" className="p-3 border rounded-lg w-full text-black placeholder-black" />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-between mt-8">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-black bg-gray-200 rounded-lg">Cancel</button>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded-lg bg-gray-200">Back</button>
            )}
            {step < 3 && (
              <button type="button" onClick={nextStep} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Next</button>
            )}
            {step === 3 && (
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Submit</button>
            )}
          </div>
        </>
      )}
    </form>
  );
}

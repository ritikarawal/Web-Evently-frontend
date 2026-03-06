'use client';

import { useState, useEffect } from 'react';
import { getVenues, getVenueById } from '@/lib/api/venues';
import { getCategoryTheme } from '@/constants/categoryThemes';

interface CreateEventFormProps {
    onCreate: (event: any) => void;
    onCancel: () => void;
}
export default function CreateEventForm({ onCreate, onCancel }: CreateEventFormProps) {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        venueId: '',
        category: '',
        ticketPrice: ''
    });

    const [venues, setVenues] = useState<any[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<any>(null);
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
    // Fetch venues on mount
    useEffect(() => {
        getVenues().then(setVenues).catch(() => setVenues([]));
    }, []);

    // Fetch selected venue details (for pricing)
    useEffect(() => {
        if (formData.venueId) {
            getVenueById(formData.venueId).then(setSelectedVenue).catch(() => setSelectedVenue(null));
        } else {
            setSelectedVenue(null);
        }
    }, [formData.venueId]);

    // Calculate price when venue or times change
    useEffect(() => {
        if (!selectedVenue || !formData.startTime || !formData.endTime) {
            setCalculatedPrice(null);
            return;
        }
        // Find pricing type (prefer hourly, fallback to daily)
        const pricing = selectedVenue.pricing || [];
        const hourly = pricing.find((p: any) => p.type === 'hourly');
        const daily = pricing.find((p: any) => p.type === 'daily');
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        const durationMs = end.getTime() - start.getTime();
        if (hourly && durationMs > 0) {
            const hours = Math.ceil(durationMs / (1000 * 60 * 60));
            setCalculatedPrice(hours * hourly.amount);
        } else if (daily && durationMs > 0) {
            const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
            setCalculatedPrice(days * daily.amount);
        } else {
            setCalculatedPrice(null);
        }
    }, [selectedVenue, formData.startTime, formData.endTime]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use calculated price if available
        const eventData = {
            ...formData,
            ticketPrice: calculatedPrice ?? formData.ticketPrice,
        };
        onCreate(eventData);
        setFormData({
            title: '',
            description: '',
            date: '',
            startTime: '',
            endTime: '',
            location: '',
            venueId: '',
            category: '',
            ticketPrice: ''
        });
        setCalculatedPrice(null);
    };

    const theme = getCategoryTheme(formData.category);
    const borderColorClass = formData.category ? theme.borderColor : 'border-gray-300';
    const focusRingColor = formData.category ? `focus:ring-${theme.textColor.split('-')[1]}-500` : 'focus:ring-indigo-500';
    const inputFocusStyle = formData.category 
      ? `border-2 ${borderColorClass} focus:ring-2 ${focusRingColor}` 
      : 'border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

    return (
        <div className={`rounded-xl shadow-2xl p-8 border-2 transition-all duration-300 ${
            formData.category
              ? `bg-gradient-to-br ${theme.bgGradient} ${theme.borderColor}`
              : 'bg-white border-gray-200'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>Event Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                              formData.category
                                ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                                : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            }`}
                            placeholder="Enter your event name"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>Category *</label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg">
                          {formData.category && <span className="text-2xl">{theme.icon}</span>}
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="flex-1 bg-transparent outline-none font-medium text-gray-700"
                          >
                            <option value="">Select a category</option>
                            <option value="birthday">🎂 Birthday</option>
                            <option value="anniversary">💕 Anniversary</option>
                            <option value="wedding">💍 Wedding</option>
                            <option value="engagement">💎 Engagement</option>
                            <option value="workshop">🛠️ Workshop</option>
                            <option value="conference">🎤 Conference</option>
                            <option value="graduation">🎓 Graduation</option>
                            <option value="fundraisers">🤝 Fundraisers</option>
                          </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>Description *</label>
                    <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                          formData.category
                            ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                            : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        }`}
                        placeholder="Describe your event in detail..."
                    />
                </div>

                {/* Venue Selection, Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>🏢 Venue *</label>
                        <select
                            name="venueId"
                            value={formData.venueId}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${formData.category ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0` : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'}`}
                        >
                            <option value="">Select a venue</option>
                            {venues.map((venue) => (
                                <option key={venue._id} value={venue._id}>{venue.name} ({venue.city})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>🕒 Start Time *</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            required
                            value={formData.startTime}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${formData.category ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0` : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>🕓 End Time *</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            required
                            value={formData.endTime}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${formData.category ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0` : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'}`}
                        />
                    </div>
                </div>

                {/* Review Section: Show Total Price */}
                <div className="pt-6 border-t-2 border-gray-200">
                    <div className="mb-4">
                        <h3 className={`text-lg font-bold ${formData.category ? theme.textColor : 'text-gray-700'}`}>Review & Total Price</h3>
                        <div className="mt-2 text-base font-semibold text-yellow-700 bg-yellow-100 rounded-lg px-4 py-2 inline-block">
                            {calculatedPrice !== null ? `Total Price: $${calculatedPrice}` : 'Set venue, start, and end time to see total price'}
                        </div>
                        {selectedVenue && selectedVenue.pricing && (
                            <div className="mt-2 text-xs text-gray-600">
                                Pricing: {selectedVenue.pricing.map((p: any, idx: number) => `${p.type}: $${p.amount}`).join(', ')}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                formData.category
                                  ? `bg-gradient-to-r ${theme.topBarGradient}`
                                  : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            ✨ Create Event
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-300/30 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400/40 transition-all duration-200"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
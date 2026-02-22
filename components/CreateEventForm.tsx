'use client';

import { useState } from 'react';
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
        location: '',
        category: '',
        capacity: '',
        ticketPrice: '',
        proposedBudget: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
        setFormData({
            title: '',
            description: '',
            date: '',
            location: '',
            category: '',
            capacity: '',
            ticketPrice: '',
            proposedBudget: ''
        });
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

                {/* Date & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>📅 Date & Time *</label>
                        <input
                            type="datetime-local"
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                              formData.category
                                ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                                : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>📍 Location *</label>
                        <input
                            type="text"
                            name="location"
                            required
                            value={formData.location}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                              formData.category
                                ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                                : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            }`}
                            placeholder="Event location (address)"
                        />
                    </div>
                </div>

                {/* Capacity & Ticket Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>👥 Capacity (Optional)</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                              formData.category
                                ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                                : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            }`}
                            placeholder="e.g. 100 (leave empty for unlimited)"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>💰 Ticket Price ($)</label>
                        <input
                            type="number"
                            name="ticketPrice"
                            value={formData.ticketPrice}
                            onChange={handleChange}
                            step="0.01"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                              formData.category
                                ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                                : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            }`}
                            placeholder="0.00 (free if empty)"
                        />
                    </div>
                </div>

                {/* Proposed Budget */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${formData.category ? theme.textColor : 'text-gray-700'}`}>🔥 Proposed Budget ($) *</label>
                    <input
                        type="number"
                        name="proposedBudget"
                        required
                        value={formData.proposedBudget}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                          formData.category
                            ? `${borderColorClass} ${theme.badgeBg} ${theme.textColor} focus:ring-2 focus:ring-offset-0`
                            : 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        }`}
                        placeholder="Enter your proposed budget for this event"
                    />
                    <p className={`text-sm mt-2 font-medium ${formData.category ? theme.textColor : 'text-gray-600'}`}>✓ Budget will be reviewed and approved by admin before payment.</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
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
            </form>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import EventCard from '../../components/EventCard';
import CreateEventForm from '../../components/CreateEventForm';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
}

export default function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        // Fetch events from API
        fetch('/api/events')
            .then(res => res.json())
            .then(data => setEvents(data));
    }, []);

    const handleCreateEvent = (event: Event) => {
        setEvents([...events, event]);
        setShowCreateForm(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Planning Dashboard</h1>
                    <p className="text-lg text-gray-600">Manage your events with ease</p>
                </header>

                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
                    >
                        + Create New Event
                    </button>
                </div>

                {showCreateForm && (
                    <div className="mb-8">
                        <CreateEventForm onCreate={handleCreateEvent} onCancel={() => setShowCreateForm(false)} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>

                {events.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No events yet</h2>
                        <p className="text-gray-500">Create your first event to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
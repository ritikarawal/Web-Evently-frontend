import { useState, useEffect } from 'react';
import { getEvents } from '@/lib/api/events';

// Mock data for events (fallback)
const mockEvents = [
  {
    id: 1,
    title: "Sample Event 1",
    description: "This is a sample event description.",
    date: "2026-02-15",
    location: "Sample Location",
    category: "birthday"
  },
  {
    id: 2,
    title: "Sample Event 2",
    description: "Another sample event.",
    date: "2026-02-20",
    location: "Another Location",
    category: "birthday"
  }
];

export const useEvents = (category: string) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Try to fetch from API
        const response = await getEvents({ category });
        if (response.success) {
          setEvents(response.data || []);
        } else {
          // Fallback to mock data
          const filteredEvents = mockEvents.filter(event => event.category === category.toLowerCase());
          setEvents(filteredEvents);
        }
      } catch (err) {
        // Fallback to mock data on error
        const filteredEvents = mockEvents.filter(event => event.category === category.toLowerCase());
        setEvents(filteredEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category]);

  return { events, loading, error };
};
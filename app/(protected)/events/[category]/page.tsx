"use client";

import React from "react";
import Link from "next/link";
import NavigationBar from "@/components/NavigationBar";
import { useEvents } from "@/lib/hooks/useEvents";
import EventCard from "@/components/EventCard";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = React.use(params);
  const categoryLabel = decodeURIComponent(category);
  const { events, loading, error } = useEvents(categoryLabel);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-300 via-rose-200 to-pink-100">
        <NavigationBar profilePicture={null} />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-700">Loading events...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-300 via-rose-200 to-pink-100">
        <NavigationBar profilePicture={null} />
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-300 via-rose-200 to-pink-100">
      <NavigationBar profilePicture={null} />
      <header className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold capitalize text-gray-800">{categoryLabel} Events</h1>
          <Link href="/home" className="text-sm text-rose-900 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>
      <section className="max-w-7xl mx-auto px-6 pb-12">
        {events.length === 0 ? (
          <p className="text-gray-700">No events found for {categoryLabel}.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

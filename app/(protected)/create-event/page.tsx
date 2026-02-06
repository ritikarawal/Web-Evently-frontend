"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Grid, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function CreateEventContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(8);
  const [currentMonth, setCurrentMonth] = useState({ month: 'December', year: 2025 });
  const [activeTab, setActiveTab] = useState('Events');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const tabs = ['Events', 'My Events', 'Notification', 'Settings'];

  const venues = [
    { name: 'Cool Haus', location: 'Chucchepati, opposite to KL tower' },
    { name: 'En Space', location: 'Chundevi' }
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const calendarDays = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null]
  ];

  // Get category from URL params and capitalize it
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const capitalizedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategory(capitalizedCategory);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#ffe4e1]">
      {/* Header */}
      <header className="bg-[#db8585] px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/evently logo.png"
              alt="Evently Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Search and Category */}
          <div className="flex items-center gap-4">
            <button className="bg-white rounded-xl px-6 py-4 flex items-center gap-2 hover:bg-gray-50 transition">
              <Grid className="w-5 h-5 text-[#49516f]" />
              <span className="text-[#49516f] font-['Poppins']">
                {selectedCategory || 'Category'}
              </span>
            </button>

            <div className="bg-white rounded-xl flex items-center overflow-hidden">
              <input
                type="text"
                placeholder="Search"
                className="px-6 py-4 w-[400px] outline-none text-[#49516f] font-['Poppins']"
              />
              <button className="bg-[#800020] p-4 hover:bg-[#600018] transition">
                <Search className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* User Icons */}
          <div className="flex items-center gap-4">
            <button className="hover:opacity-80 transition">
              <div className="w-[70px] h-[70px] rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </button>
            <button className="hover:opacity-80 transition">
              <div className="w-[70px] h-[70px] rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#ffe4e1] pt-8 pb-6">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab}
                href={tab === 'Events' ? '/home' : tab === 'My Events' ? '/my-events' : tab === 'Notification' ? '/notifications' : '/settings'}
                className="relative pb-2 transition"
              >
                <span className={`font-['Poppins'] text-2xl ${
                  activeTab === tab ? 'text-black font-semibold' : 'text-black opacity-50'
                }`}>
                  {tab}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 h-1 bg-[#db8585] w-full rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home" className="hover:opacity-70 transition">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 23 22">
              <path d="M15 18l-6-6 6-6" stroke="#992727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div>
            <h1 className="font-['Quicksand'] font-medium text-[32px] text-black">
              Create New Event
            </h1>
            {selectedCategory && (
              <p className="font-['Poppins'] text-[18px] text-[#49516f] mt-1">
                Category: <span className="font-semibold text-[#db8585]">{selectedCategory}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Event Image Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-[30px] overflow-hidden shadow-lg">
              <div className="w-full h-[280px] bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Event Image</span>
              </div>
            </div>

            {/* Recommendation Venues */}
            <div className="bg-white rounded-[30px] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-[#121417]">
                  Recommendation Venues
                </h2>
                <button className="font-['Plus_Jakarta_Sans'] font-bold text-[#661a1a] hover:opacity-70 transition">
                  More
                </button>
              </div>

              <div className="space-y-3">
                {venues.map((venue, index) => (
                  <div
                    key={index}
                    className="bg-[#ffced8] rounded-[20px] p-4 flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-2 border-black"
                    />
                    <div className="flex-1">
                      <div className="font-['Plus_Jakarta_Sans'] font-medium text-[16px] text-black flex items-center gap-2">
                        {venue.name}
                      </div>
                      <div className="font-['Plus_Jakarta_Sans'] font-medium text-[16px] text-black flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {venue.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-black">
              Note: Celebration includes a cake, candles, and basic decor elements.
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-xl border border-[#ebebeb] shadow-lg p-8">
            {/* Month Selector */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-['Inter'] font-bold text-2xl text-[#333]">
                {currentMonth.month} {currentMonth.year}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {/* Previous month logic */}}
                  className="hover:opacity-70 transition"
                >
                  <ChevronLeft className="w-6 h-6 text-[#333]" />
                </button>
                <button
                  onClick={() => {/* Next month logic */}}
                  className="hover:opacity-70 transition"
                >
                  <ChevronRight className="w-6 h-6 text-[#333]" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="font-['Inter'] font-medium text-2xl text-[#333]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2 text-center">
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex items-center justify-center h-14">
                      {day && (
                        <button
                          onClick={() => setSelectedDate(day)}
                          className={`w-14 h-14 rounded-full font-['Inter'] font-medium text-2xl transition ${
                            selectedDate === day
                              ? 'bg-[#ffced8] text-white'
                              : 'text-[#666] hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Notes and Duration Section */}
          <div className="space-y-6">
            {/* Notes */}
            <div className="bg-white rounded-[30px] p-8 shadow-lg min-h-[400px]">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-[#661a1a] mb-6">
                Any note for us or want to customize something?
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="write here"
                className="w-full h-[300px] outline-none font-['Poppins'] text-[18px] text-[#49516f] placeholder-[#49516f] placeholder-opacity-70 resize-none"
              />
            </div>

            {/* Duration */}
            <div className="bg-[#ff7474] rounded-[20px] p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <label className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-white">
                  Duration:
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Write Duration"
                  className="flex-1 bg-transparent outline-none font-['Poppins'] text-[20px] text-[#49516f] placeholder-[#49516f] placeholder-opacity-70"
                />
              </div>
            </div>

            {/* Send Approval Button */}
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission here
              console.log('Event data:', {
                category: selectedCategory,
                selectedDate,
                duration,
                notes,
                // Add other form data as needed
              });
            }}>
              <input type="hidden" name="category" value={selectedCategory} />
              <button
                type="submit"
                className="w-full bg-[#800020] hover:bg-[#600018] transition rounded-[30px] py-4 shadow-lg"
              >
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-white">
                  Send Approval
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEventContent />
    </Suspense>
  );
}
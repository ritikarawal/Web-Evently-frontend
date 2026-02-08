"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Grid, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createEvent, updateEvent } from '@/lib/api/events';

function CreateEventContent() {
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('Events');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);

  const tabs = ['Events', 'My Events', 'Notification', 'Settings'];

  const venues = [
    { name: 'Cool Haus', location: 'Chucchepati, opposite to KL tower' },
    { name: 'En Space', location: 'Chundevi' }
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Get category from URL params and capitalize it
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const capitalizedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategory(capitalizedCategory);
    }
  }, [searchParams]);

  // Check for edit event in localStorage
  useEffect(() => {
    const editEventData = localStorage.getItem('editEvent');
    if (editEventData) {
      try {
        const event = JSON.parse(editEventData);
        setIsEditing(true);
        setEditEventId(event._id);
        setSelectedCategory(event.category.charAt(0).toUpperCase() + event.category.slice(1));
        setStartDate(new Date(event.startDate));
        setEndDate(new Date(event.endDate));
        setNotes(event.description);
        // Clear the localStorage
        localStorage.removeItem('editEvent');
      } catch (error) {
        console.error('Error parsing edit event data:', error);
      }
    }
  }, []);

  // Generate calendar days for the current month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Get last day of previous month
    const lastDayPrevMonth = new Date(year, month, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Add days from previous month
    const prevMonthDays = adjustedStartingDay;
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      currentWeek.push(null);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add days from next month to fill the last week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  // Month navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Handle date selection for range
  const handleDateSelect = (day: number) => {
    const selectedDateTime = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate) {
      setStartDate(selectedDateTime);
      setEndDate(null);
    } else if (!endDate) {
      if (selectedDateTime < startDate) {
        setEndDate(startDate);
        setStartDate(selectedDateTime);
      } else {
        setEndDate(selectedDateTime);
      }
    } else {
      // Reset selection
      setStartDate(selectedDateTime);
      setEndDate(null);
    }
  };

  // Check if a date is selected (in range)
  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!startDate) return false;
    if (startDate && !endDate) {
      return date.getTime() === startDate.getTime();
    }
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    return false;
  };

  // Check if a date is the start or end of range
  const isRangeStart = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.getTime() === startDate.getTime();
  };

  const isRangeEnd = (day: number) => {
    if (!endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.getTime() === endDate.getTime();
  };

  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear();
  };

  const calendarDays = generateCalendarDays(currentMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe4e1] via-[#fff5f5] to-[#f8e8e8]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#db8585] to-[#c76b6b] px-6 py-4 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2">
              <Image
                src="/evently logo.png"
                alt="Evently Logo"
                width={70}
                height={70}
                className="object-contain"
              />
            </div>
          </div>

          {/* Search and Category */}
          <div className="flex items-center gap-4">
            <button className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-2 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg">
              <Grid className="w-5 h-5 text-[#49516f]" />
              <span className="text-[#49516f] font-['Poppins'] font-medium">
                {selectedCategory || 'Category'}
              </span>
            </button>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl flex items-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <input
                type="text"
                placeholder="Search events..."
                className="px-6 py-4 w-[400px] outline-none text-[#49516f] font-['Poppins'] placeholder:text-[#49516f]/60"
              />
              <button className="bg-gradient-to-r from-[#800020] to-[#600018] p-4 hover:from-[#600018] hover:to-[#400010] transition-all duration-300">
                <Search className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* User Icons */}
          <div className="flex items-center gap-4">
            <button className="hover:scale-110 transition-transform duration-300">
              <div className="w-[70px] h-[70px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </button>
            <button className="hover:scale-110 transition-transform duration-300">
              <div className="w-[70px] h-[70px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gradient-to-r from-[#ffe4e1] to-[#fff5f5] pt-8 pb-6 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab}
                href={tab === 'Events' ? '/home' : tab === 'My Events' ? '/my-events' : tab === 'Notification' ? '/notifications' : '/settings'}
                className="relative pb-2 transition-all duration-300 group"
              >
                <span className={`font-['Poppins'] text-2xl transition-all duration-300 ${
                  activeTab === tab 
                    ? 'text-black font-normal scale-105' 
                    : 'text-black/60 hover:text-black/80 group-hover:scale-105'
                }`}>
                  {tab}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#db8585] to-[#c76b6b] w-full rounded-full shadow-sm" />
                )}
                {activeTab !== tab && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-transparent group-hover:bg-[#db8585]/50 w-full rounded-full transition-all duration-300" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/home" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
              <svg className="w-6 h-6 text-[#992727] group-hover:text-[#db8585] transition-colors duration-300" fill="none" viewBox="0 0 23 22">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="font-['Quicksand'] font-normal text-[36px] text-black bg-gradient-to-r from-[#db8585] to-[#c76b6b] bg-clip-text text-transparent">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h1>
            {selectedCategory && (
              <p className="font-['Poppins'] text-[18px] text-[#49516f] flex items-center gap-2">
                <span className="text-[#db8585] font-normal">✨</span>
                Category: <span className="font-normal text-[#db8585] bg-[#db8585]/10 px-3 py-1 rounded-full">{selectedCategory}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Event Image Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-[20px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/50">
              <div className="w-full h-[200px] bg-gradient-to-br from-[#f8e8e8] to-[#ffe4e1] flex items-center justify-center relative group">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-md">
                    <svg className="w-6 h-6 text-[#db8585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[#49516f] font-['Poppins'] font-normal text-sm">Upload Event Image</span>
                  <button className="bg-gradient-to-r from-[#db8585] to-[#c76b6b] text-white px-4 py-2 rounded-full font-['Poppins'] text-sm font-normal hover:from-[#c76b6b] hover:to-[#a85a5a] transition-all duration-300 hover:scale-105 shadow-md">
                    Choose File
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Recommendation Venues */}
            <div className="bg-white rounded-[20px] p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#121417] bg-gradient-to-r from-[#db8585] to-[#c76b6b] bg-clip-text text-transparent">
                  ✨ Recommended Venues
                </h2>
                <button className="font-['Plus_Jakarta_Sans'] font-normal text-[#661a1a] text-sm hover:text-[#db8585] transition-colors duration-300 hover:scale-110">
                  More →
                </button>
              </div>

              <div className="space-y-3">
                {venues.map((venue, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-[#ffced8] to-[#ffb3c1] rounded-[15px] p-3 flex items-start gap-3 hover:from-[#ffb3c1] hover:to-[#ff9bb0] transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-2 border-black accent-[#db8585] hover:scale-110 transition-transform duration-200"
                    />
                    <div className="flex-1">
                      <div className="font-['Plus_Jakarta_Sans'] font-normal text-[14px] text-black flex items-center gap-2 group-hover:text-[#661a1a] transition-colors duration-300">
                        🏛️ {venue.name}
                      </div>
                      <div className="font-['Plus_Jakarta_Sans'] font-normal text-[12px] text-black/80 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[#db8585]" />
                        {venue.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-gradient-to-r from-[#fff5f5] to-[#f8e8e8] rounded-[15px] p-4 shadow-md border border-[#db8585]/20">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-normal text-[14px] text-[#661a1a] mb-1">
                    Important Note
                  </h3>
                  <p className="font-['Poppins'] text-[12px] text-[#49516f] leading-relaxed">
                    Celebration includes a cake, candles, and basic decor elements. Additional customizations can be requested in the notes section.
                  </p>
                </div>
              </div>
            </div> 
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-[15px] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/50 p-4">
            {/* Month Selector */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Inter'] font-normal text-xl text-[#333] bg-gradient-to-r from-[#db8585] to-[#c76b6b] bg-clip-text text-transparent">
                📅 {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] hover:from-[#ffe4e1] hover:to-[#f8e8e8] p-1.5 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4 text-[#db8585]" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="bg-gradient-to-r from-[#f8e8e8] to-[#ffe4e1] hover:from-[#ffe4e1] hover:to-[#f8e8e8] p-1.5 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                >
                  <ChevronRight className="w-4 h-4 text-[#db8585]" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-3">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="font-['Inter'] font-normal text-xs text-[#666] py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1 text-center">
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex items-center justify-center">
                      {day ? (
                        <button
                          onClick={() => handleDateSelect(day)}
                          className={`w-8 h-8 rounded-lg font-['Inter'] font-normal text-xs transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md relative ${
                            isRangeStart(day)
                              ? 'bg-gradient-to-r from-[#db8585] to-[#c76b6b] text-white shadow-md scale-105 rounded-l-lg'
                              : isRangeEnd(day)
                              ? 'bg-gradient-to-r from-[#db8585] to-[#c76b6b] text-white shadow-md scale-105 rounded-r-lg'
                              : isDateSelected(day)
                              ? 'bg-gradient-to-r from-[#db8585]/80 to-[#c76b6b]/80 text-white'
                              : isToday(day)
                              ? 'bg-gradient-to-r from-[#ffe4e1] to-[#f8e8e8] text-[#db8585] border border-[#db8585]'
                              : 'text-[#666] hover:bg-gradient-to-r hover:from-[#ffe4e1] hover:to-[#f8e8e8] hover:text-[#db8585]'
                          }`}
                        >
                          {day}
                          {isToday(day) && !isDateSelected(day) && (
                            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-[#db8585] rounded-full"></div>
                          )}
                        </button>
                      ) : (
                        <div className="w-8 h-8"></div>
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
            <div className="bg-white rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/50 min-h-[280px]">
              <h3 className="font-['Plus_Jakarta_Sans'] font-normal text-[18px] text-[#661a1a] mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Any notes for us or want to customize something?
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your special requests, dietary preferences, theme ideas, or any other details here..."
                className="w-full h-[200px] outline-none font-['Poppins'] text-[16px] text-[#49516f] placeholder-[#49516f]/60 resize-none bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-xl p-4 border border-[#db8585]/20 focus:border-[#db8585] focus:ring-2 focus:ring-[#db8585]/20 transition-all duration-300"
              />
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-r from-[#ff7474] to-[#e55a5a] rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3">
                <label className="font-['Plus_Jakarta_Sans'] font-normal text-xl text-white flex items-center gap-2">
                  <span>⏰</span>
                  Duration:
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 2 hours, 3-5 PM"
                  className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 outline-none font-['Poppins'] text-[16px] text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Send Approval Button */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!startDate) return;

              setLoading(true);
              setMessage('');

              try {
                const eventData = {
                  title: `${selectedCategory} Event`,
                  description: notes || `A ${selectedCategory} event`,
                  startDate: startDate.toISOString(),
                  endDate: endDate ? endDate.toISOString() : startDate.toISOString(),
                  location: 'To be determined', // This could be enhanced to include venue selection
                  category: selectedCategory.toLowerCase(),
                  isPublic: true,
                  duration,
                  notes,
                };

                let response;
                if (isEditing && editEventId) {
                  response = await updateEvent(editEventId, eventData);
                  setMessage('Event updated successfully!');
                } else {
                  response = await createEvent(eventData);
                  setMessage('Event approval request sent successfully! Waiting for admin approval.');
                }
                console.log('Event processed:', response);

                // Reset form
                setStartDate(null);
                setEndDate(null);
                setDuration('');
                setNotes('');
                setIsEditing(false);
                setEditEventId(null);
              } catch (error: any) {
                setMessage(error.message || 'Failed to send approval request');
                console.error('Error creating event:', error);
              } finally {
                setLoading(false);
              }
            }}>
              <input type="hidden" name="category" value={selectedCategory} />
              {startDate && (
                <div className="mb-4 bg-gradient-to-r from-[#e8f4fd] to-[#d4edff] rounded-[15px] p-4 border border-[#4a90e2]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="font-['Plus_Jakarta_Sans'] font-normal text-[14px] text-[#2c5aa0]">
                        Selected Date Range
                      </p>
                      <p className="font-['Poppins'] text-[12px] text-[#49516f]">
                        {startDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {endDate && (
                          <> to {endDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#800020] via-[#600018] to-[#400010] hover:from-[#600018] hover:via-[#400010] hover:to-[#200008] transition-all duration-300 rounded-[20px] py-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!startDate || loading}
              >
                <span className="font-['Plus_Jakarta_Sans'] font-normal text-xl text-white flex items-center justify-center gap-2">
                  <span>🚀</span>
                  {loading ? 'Processing...' : isEditing ? 'Update Event' : 'Send Approval Request'}
                </span>
              </button>

              {message && (
                <div className={`mt-4 p-4 rounded-[15px] text-center ${
                  message.includes('successfully')
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  <p className="font-['Poppins'] text-sm">{message}</p>
                </div>
              )}
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
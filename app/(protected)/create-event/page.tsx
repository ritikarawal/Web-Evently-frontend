"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock, Upload, Star, Users, Check } from 'lucide-react';
import Link from 'next/link';
import { createEvent, updateEvent } from '@/lib/api/events';
import * as venuesApi from '@/lib/api/venues';

function CreateEventContent() {
      // Paid/Free option for public events
      const [eventType, setEventType] = useState<'paid' | 'free'>('free');
      const [ticketPrice, setTicketPrice] = useState('');
    // --- Total Price Calculation ---
    const [venueDetails, setVenueDetails] = useState<any>(null);
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // recommended venues removed from quick create per request
    const [recommendedVenues, setRecommendedVenues] = useState<any[]>([]);
    const [recommendedLoading, setRecommendedLoading] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState('');

    // Fetch venue details when selectedVenue changes
    useEffect(() => {
      if (!selectedVenue) {
        setVenueDetails(null);
        return;
      }
      // Try to find in recommendedVenues first
      const found = recommendedVenues.find(v => v.name === selectedVenue);
      if (found) {
        setVenueDetails(found);
        return;
      }
      // Otherwise, fetch by name (if API supports it)
      venuesApi.getVenues({ name: selectedVenue }).then((venues) => {
        setVenueDetails(venues && venues.length > 0 ? venues[0] : null);
      }).catch(() => setVenueDetails(null));
    }, [selectedVenue, recommendedVenues]);

    // Calculate price when venueDetails or time changes
    useEffect(() => {
      if (!venueDetails || !startTime || !endTime) {
        setCalculatedPrice(null);
        return;
      }
      const pricing = [
        { type: 'hourly', amount: venueDetails.pricePerHour },
        { type: 'daily', amount: venueDetails.pricePerDay }
      ].filter(p => p.amount);
      const start = new Date();
      const end = new Date();
      // Use today's date, just set hours/minutes
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      start.setHours(sh || 0, sm || 0, 0, 0);
      end.setHours(eh || 0, em || 0, 0, 0);
      const durationMs = end.getTime() - start.getTime();
      const hourlyPricing = pricing.find(p => p.type === 'hourly');
      const dailyPricing = pricing.find(p => p.type === 'daily');
      
      if (hourlyPricing && durationMs > 0) {
        const hours = Math.ceil(durationMs / (1000 * 60 * 60));
        setCalculatedPrice(hours * hourlyPricing.amount);
      } else if (dailyPricing && durationMs > 0) {
        const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        setCalculatedPrice(days * dailyPricing.amount);
      } else {
        setCalculatedPrice(null);
      }
    }, [venueDetails, startTime, endTime]);
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Event details' },
    { number: 2, title: 'Date & Time', description: 'When it happens' },
    { number: 3, title: 'Venue', description: 'Where it happens' },
    { number: 4, title: 'Review', description: 'Confirm details' }
  ];
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    }
  }, [searchParams]);

  useEffect(() => {
    const editEventData = localStorage.getItem('editEvent');
    if (editEventData) {
      try {
        const event = JSON.parse(editEventData);
        setIsEditing(true);
        setEditEventId(event._id);
        setSelectedCategory(event.category.toLowerCase());
        setEventTitle(event.title || '');
        setStartDate(new Date(event.startDate));
        setEndDate(new Date(event.endDate));
        setDescription(event.description);
        setSelectedVenue(event.location || '');
        setIsPublic(event.isPublic !== false); // Default to true if not specified
        // Removed setCapacity
        localStorage.removeItem('editEvent');
      } catch (error) {
        console.error('Error parsing edit event data:', error);
      }
    }
  }, []);

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDateTime = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDateTime);
      setEndDate(null);
    } else {
      if (selectedDateTime < startDate) {
        setEndDate(startDate);
        setStartDate(selectedDateTime);
      } else {
        setEndDate(selectedDateTime);
      }
    }
  };

  const isDateInRange = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!startDate) return false;
    if (!endDate) return date.getTime() === startDate.getTime();
    return date >= startDate && date <= endDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear();
  };

  const calendarDays = generateCalendarDays(currentMonth);

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return eventTitle.trim() !== '' && selectedCategory !== '';
      case 2:
        return startDate !== null;
      case 3:
        return selectedVenue.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !eventTitle || !selectedCategory) return;

    setLoading(true);
    setMessage('');

    try {
      const eventData = {
        title: eventTitle,
        description: description || `A ${selectedCategory} event`,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : startDate.toISOString(),
        location: selectedVenue || 'TBD',
        category: selectedCategory.toLowerCase(),
        isPublic: isPublic,
        status: 'pending',
        duration: `${startTime} - ${endTime}`,
        notes: description,
        eventType: eventType,
        ticketPrice: eventType === 'paid' ? Number(ticketPrice) : 0,
      };

      if (isEditing && editEventId) {
        await updateEvent(editEventId, eventData);
        setMessage('Event updated successfully!');
      } else {
        await createEvent(eventData);
        setMessage('Event created successfully!');
      }

      setTimeout(() => {
        window.location.href = '/home';
      }, 1500);
    } catch (error: any) {
      setMessage(error.message || 'Failed to process event');
    } finally {
      setLoading(false);
    }
  };

  // (moved up)
  const fetchRecommended = async (category: string) => {
    if (!category) {
      setRecommendedVenues([]);
      return;
    }
    setRecommendedLoading(true);
    try {
      const res = await venuesApi.getVenues({ recommendedCategory: category.toLowerCase(), isActive: true });
      setRecommendedVenues(res || []);
    } catch (err) {
      console.error('Failed to fetch recommended venues:', err);
      setRecommendedVenues([]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) fetchRecommended(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 min-h-[500px]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Header removed as requested */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter your event name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg text-black placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black bg-white"
                >
                  <option value="">Select a category</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="graduation">Graduation</option>
                  <option value="fundraisers">Fundraisers</option>
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="education">Education</option>
                  <option value="business">Business</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your event in detail..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-black placeholder-gray-400"
                />
              </div>

              {/* Removed Maximum Capacity and Proposed Budget fields */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Event Visibility *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="public"
                      name="visibility"
                      value="public"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="public" className="ml-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-green-600" />
                        Public Event
                      </div>
                      <p className="text-gray-600 text-xs mt-1">Anyone can discover and join this event</p>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="private" className="ml-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-purple-600" />
                        Private Event
                      </div>
                      <p className="text-gray-600 text-xs mt-1">Only invited guests can see this event</p>
                    </label>
                  </div>
                </div>
                {/* Paid/Free option for public events */}
                {isPublic && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventType"
                          value="free"
                          checked={eventType === 'free'}
                          onChange={() => setEventType('free')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2">Free</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventType"
                          value="paid"
                          checked={eventType === 'paid'}
                          onChange={() => setEventType('paid')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2">Paid</span>
                      </label>
                    </div>
                    {eventType === 'paid' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ticketPrice}
                          onChange={e => setTicketPrice(e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black placeholder-gray-400"
                          placeholder="e.g. 10"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Date & Time</h2>
                <p className="text-gray-600">When will your event take place?</p>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Calendar UI */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-700">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {calendarDays.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                      {week.map((day, dayIndex) => (
                        <div key={dayIndex}>
                          {day ? (
                            <button
                              type="button"
                              onClick={() => handleDateSelect(day)}
                              className={`w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                                isDateInRange(day)
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : isToday(day)
                                  ? 'bg-gray-100 text-gray-900 border-2 border-blue-500'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {day}
                            </button>
                          ) : (
                            <div className="w-full aspect-square" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {startDate && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      {startDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      {endDate && ` - ${endDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Venue */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Venue</h2>
                  <p className="text-gray-600">Choose a location for your event</p>
                </div>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all ${selectedVenue && recommendedVenues.some((v) => v.name === selectedVenue) ? 'bg-blue-600 text-white border-blue-600' : 'bg-black text-white border-black'}`}
                    onClick={() => setSelectedVenue(recommendedVenues[0]?.name || '')}
                    disabled={recommendedVenues.length === 0}
                  >
                    Recommended Venues
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all ${selectedVenue && !recommendedVenues.some((v) => v.name === selectedVenue) ? 'bg-blue-600 text-white border-blue-600' : 'bg-black text-white border-black'}`}
                    onClick={() => setSelectedVenue('')}
                  >
                    Custom Venue
                  </button>
                </div>
                {(!selectedVenue || recommendedVenues.some(v => v.name === selectedVenue)) && recommendedVenues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recommended for {selectedCategory}
                    </h3>
                    <div className="space-y-3">
                      {recommendedLoading ? (
                        <p className="text-sm text-gray-500">Loading recommendations...</p>
                      ) : (
                        recommendedVenues.map((venue, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedVenue(venue.name)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              selectedVenue === venue.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="radio"
                                checked={selectedVenue === venue.name}
                                onChange={() => setSelectedVenue(venue.name)}
                                className="mt-1 w-5 h-5 text-blue-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-lg text-gray-900">{venue.name}</h4>
                                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium text-gray-700">{venue.rating || '—'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{venue.city || venue.location || ''}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-blue-600 font-semibold">{venue.pricePerHour ? `$${venue.pricePerHour}/hr` : ''}</span>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{venue.capacity ? `${venue.capacity} guests` : ''}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {(!recommendedVenues.some(v => v.name === selectedVenue) || recommendedVenues.length === 0) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or enter a custom venue</label>
                    <input
                      type="text"
                      value={selectedVenue}
                      onChange={(e) => setSelectedVenue(e.target.value)}
                      placeholder="Custom venue name or address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black placeholder-gray-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Event</h2>
                <p className="text-gray-600">Make sure everything looks good</p>
              </div>

              <div className="space-y-4">
                {/* Total Price Section */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-medium text-yellow-700 mb-1">Total Price</h3>
                  <p className="text-lg font-bold text-yellow-900">
                    {calculatedPrice !== null ? `$${calculatedPrice}` : 'Set venue, start, and end time to see total price'}
                  </p>
                  {venueDetails && (venueDetails.pricePerHour || venueDetails.pricePerDay) && (
                    <div className="text-xs text-gray-600 mt-1">
                      Pricing: {venueDetails.pricePerHour ? `hourly: $${venueDetails.pricePerHour}` : ''}
                      {venueDetails.pricePerHour && venueDetails.pricePerDay ? ', ' : ''}
                      {venueDetails.pricePerDay ? `daily: $${venueDetails.pricePerDay}` : ''}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Event Title</h3>
                  <p className="text-lg font-semibold text-gray-900">{eventTitle}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedCategory}</p>
                </div>

                {description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-900">{description}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {startDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                    {endDate && ` - ${endDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}`}
                  </p>
                </div>

                {(startTime || endTime) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Venue</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedVenue}</p>
                </div>

                {/* Removed Capacity review section */}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Visibility</h3>
                  <div className="flex items-center">
                    {isPublic ? (
                      <>
                        <Users className="w-5 h-5 mr-2 text-green-600" />
                        <p className="text-lg font-semibold text-green-700">Public Event</p>
                        <p className="text-sm text-gray-600 ml-2">Anyone can discover and join</p>
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5 mr-2 text-purple-600" />
                        <p className="text-lg font-semibold text-purple-700">Private Event</p>
                        <p className="text-sm text-gray-600 ml-2">Only invited guests can see</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('successfully')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : isEditing ? 'Update Event' : 'Create Event'}
            </button>
          )}
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
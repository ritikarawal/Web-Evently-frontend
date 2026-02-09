"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock, Upload, Star, Users, Check } from 'lucide-react';
import Link from 'next/link';
import { createEvent, updateEvent } from '@/lib/api/events';
import NavigationBar from "@/components/NavigationBar";

function CreateEventContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Event details' },
    { number: 2, title: 'Date & Time', description: 'When it happens' },
    { number: 3, title: 'Venue', description: 'Where it happens' },
    { number: 4, title: 'Review', description: 'Confirm details' }
  ];

  // Venue recommendations based on event category
  const venuesByCategory: Record<string, Array<{
    name: string;
    location: string;
    rating: number;
    price: string;
    capacity: string;
  }>> = {
    birthday: [
      { name: 'Party Palace Kathmandu', location: 'Thamel', rating: 4.8, price: '$$', capacity: '50-100' },
      { name: 'Celebration Hall', location: 'Lazimpat', rating: 4.6, price: '$$$', capacity: '100-150' },
      { name: 'Fun Zone Events', location: 'Durbarmarg', rating: 4.5, price: '$$', capacity: '30-80' }
    ],
    education: [
      { name: 'Academic Hall', location: 'Kirtipur', rating: 4.5, price: '$', capacity: '100-200' },
      { name: 'Learning Hub', location: 'Putalisadak', rating: 4.6, price: '$$', capacity: '30-50' },
      { name: 'Innovation Lab', location: 'Kupondole', rating: 4.8, price: '$$$', capacity: '40-60' }
    ],
    business: [
      { name: 'Business Hub Kathmandu', location: 'Durbar Marg', rating: 4.7, price: '$$$', capacity: '100-200' },
      { name: 'Executive Meeting Space', location: 'Baluwatar', rating: 4.8, price: '$$$$', capacity: '50-100' },
      { name: 'Professional Center', location: 'New Baneshwor', rating: 4.7, price: '$$', capacity: '80-150' }
    ],
    entertainment: [
      { name: 'Grand Celebration Center', location: 'Naxal', rating: 4.7, price: '$$$', capacity: '250-350' },
      { name: 'Fun Zone Events', location: 'Durbarmarg', rating: 4.5, price: '$$', capacity: '30-80' },
      { name: 'Modern Display Hall', location: 'Tripureshwor', rating: 4.4, price: '$$', capacity: '200-300' }
    ],
    graduation: [
      { name: 'University Auditorium', location: 'Kirtipur', rating: 4.6, price: '$$', capacity: '300-500' },
      { name: 'Graduation Hall', location: 'Pulchowk', rating: 4.7, price: '$$$', capacity: '200-400' },
      { name: 'Academic Center', location: 'Balkhu', rating: 4.5, price: '$$', capacity: '150-300' }
    ],
    anniversary: [
      { name: 'Romantic Garden Restaurant', location: 'Lazimpat', rating: 4.8, price: '$$$$', capacity: '20-50' },
      { name: 'Anniversary Banquet Hall', location: 'Thamel', rating: 4.7, price: '$$$', capacity: '50-100' },
      { name: 'Couples Retreat Center', location: 'Bouddha', rating: 4.6, price: '$$$', capacity: '30-80' }
    ],
    other: [
      { name: 'Community Center', location: 'Kalanki', rating: 4.4, price: '$', capacity: '50-150' },
      { name: 'Local Hall', location: 'Swayambhu', rating: 4.3, price: '$', capacity: '30-100' },
      { name: 'Multi-purpose Venue', location: 'Chabahil', rating: 4.5, price: '$$', capacity: '100-200' }
    ]
  };

  const getRecommendedVenues = () => {
    return venuesByCategory[selectedCategory] || [];
  };

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
        isPublic: true,
        duration: `${startTime} - ${endTime}`,
        notes: description,
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

  const recommendedVenues = getRecommendedVenues();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar profilePicture={null} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <button className="w-12 h-12 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm transition-all">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Event' : 'Create Event'}
            </h1>
            {selectedCategory && (
              <p className="text-gray-600 mt-1">{selectedCategory}</p>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 rounded transition-all ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 min-h-[500px]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Tell us about your event</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter your event name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={selectedCategory}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Date *
                  </label>
                  <div className="flex gap-2">
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
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Venue</h2>
                <p className="text-gray-600">Choose a location for your event</p>
              </div>

              {recommendedVenues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recommended for {selectedCategory}
                  </h3>
                  <div className="space-y-3">
                    {recommendedVenues.map((venue, index) => (
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
                                <span className="text-sm font-medium text-gray-700">{venue.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{venue.location}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-blue-600 font-semibold">{venue.price}</span>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{venue.capacity} guests</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter custom venue *
                </label>
                <input
                  type="text"
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  placeholder="Enter venue name or location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
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
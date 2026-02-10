"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProfile, logout } from "@/lib/api/auth";
import NavigationBar from "@/components/NavigationBar";
import { FaBirthdayCake, FaHeart, FaRing, FaGem, FaTools, FaMicrophone, FaGraduationCap, FaDonate, FaPlus, FaCalendarAlt, FaUsers, FaStar, FaEdit, FaEye, FaTrash, FaClock, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled';
  capacity: number;
  attendees: number;
  organizer: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'drafts'>('upcoming');

  const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (const rawCookie of cookies) {
      const cookie = rawCookie.trim();
      if (cookie.startsWith(nameEQ)) {
        const value = cookie.substring(nameEQ.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfilePicture = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

        const userDataRaw = getCookieValue("user_data");
        if (userDataRaw) {
          try {
            const parsed = JSON.parse(userDataRaw) as { profilePicture?: string };
            if (parsed?.profilePicture && isMounted) {
              setProfilePicture(`${baseUrl}${parsed.profilePicture}`);
            }
          } catch {
            // ignore invalid cookie payload
          }
        }

        const response = await getProfile();
        const profilePic = response?.data?.profilePicture;
        const resolvedUrl = profilePic ? `${baseUrl}${profilePic}` : null;
        if (isMounted) {
          setProfilePicture(resolvedUrl);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    const fetchUserEvents = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const response = await fetch(`${baseUrl}/api/events/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookieValue('access_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setEvents(data.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching user events:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfilePicture();
    fetchUserEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.startDate);

    switch (activeTab) {
      case 'upcoming':
        return eventDate >= now && event.status === 'published';
      case 'past':
        return eventDate < now && event.status === 'published';
      case 'drafts':
        return event.status === 'draft';
      default:
        return true;
    }
  });

  const quickStats = [
    {
      icon: FaCalendarAlt,
      label: "Total Events",
      value: events.length.toString(),
      color: "text-blue-600"
    },
    {
      icon: FaUsers,
      label: "Total Attendees",
      value: events.reduce((sum, event) => sum + event.attendees, 0).toString(),
      color: "text-green-600"
    },
    {
      icon: FaTicketAlt,
      label: "Published Events",
      value: events.filter(e => e.status === 'published').length.toString(),
      color: "text-purple-600"
    }
  ];

  const eventCategories = [
    {
      name: "Birthday",
      icon: FaBirthdayCake,
      iconColor: "text-pink-500",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      hoverColor: "hover:from-pink-100 hover:to-rose-100",
      borderColor: "border-pink-200"
    },
    {
      name: "Anniversary",
      icon: FaHeart,
      iconColor: "text-red-500",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      hoverColor: "hover:from-red-100 hover:to-pink-100",
      borderColor: "border-red-200"
    },
    {
      name: "Wedding",
      icon: FaRing,
      iconColor: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      hoverColor: "hover:from-purple-100 hover:to-indigo-100",
      borderColor: "border-purple-200"
    },
    {
      name: "Engagement",
      icon: FaGem,
      iconColor: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      hoverColor: "hover:from-blue-100 hover:to-cyan-100",
      borderColor: "border-blue-200"
    },
    {
      name: "Workshop",
      icon: FaTools,
      iconColor: "text-green-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      hoverColor: "hover:from-green-100 hover:to-emerald-100",
      borderColor: "border-green-200"
    },
    {
      name: "Conference",
      icon: FaMicrophone,
      iconColor: "text-indigo-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      hoverColor: "hover:from-indigo-100 hover:to-purple-100",
      borderColor: "border-indigo-200"
    },
    {
      name: "Graduation",
      icon: FaGraduationCap,
      iconColor: "text-yellow-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      hoverColor: "hover:from-yellow-100 hover:to-orange-100",
      borderColor: "border-yellow-200"
    },
    {
      name: "Fundraisers",
      icon: FaDonate,
      iconColor: "text-orange-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      hoverColor: "hover:from-orange-100 hover:to-red-100",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <NavigationBar profilePicture={profilePicture} />

      {/* Dashboard Header */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">Manage your events and track your success</p>
          </div>
          <Link
            href="/create-event"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus className="w-5 h-5" />
            Create New Event
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={stat.label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'upcoming', label: 'Upcoming Events', icon: FaCalendarAlt },
                { id: 'past', label: 'Past Events', icon: FaClock },
                { id: 'drafts', label: 'Drafts', icon: FaEdit }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Events Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Loading your events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'upcoming' && 'No upcoming events'}
                  {activeTab === 'past' && 'No past events'}
                  {activeTab === 'drafts' && 'No draft events'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'upcoming' && 'Create your first event to get started!'}
                  {activeTab === 'past' && 'Your completed events will appear here.'}
                  {activeTab === 'drafts' && 'Save events as drafts to work on them later.'}
                </p>
                {activeTab === 'upcoming' && (
                  <Link
                    href="/create-event"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create Your First Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-500">Date:</span>
                              <div className="text-gray-900">{new Date(event.startDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-500">Location:</span>
                              <div className="text-gray-900">{event.location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUsers className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-500">Attendees:</span>
                              <div className="text-gray-900">{event.attendees}/{event.capacity}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaTicketAlt className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-500">Category:</span>
                              <div className="text-gray-900">{event.category}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Created {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          <FaEye className="w-4 h-4" />
                          View
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                          <FaEdit className="w-4 h-4" />
                          Edit
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                          <FaTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Create Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Create</h2>
            <p className="text-gray-600">Choose an event type to get started quickly</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {eventCategories.map((category) => (
              <Link
                key={category.name}
                href={`/create-event?category=${category.name.toLowerCase()}`}
                className={`${category.bgColor} ${category.hoverColor} ${category.borderColor} border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group cursor-pointer`}
              >
                <div className={`text-2xl group-hover:scale-110 transition-transform duration-200`}>
                  <category.icon className={category.iconColor} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
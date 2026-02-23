"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { logout } from "@/lib/api/auth";
import { clearAuthCookiesClient } from "@/lib/client-cookie";
import {
  AdminUserPayload,
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/lib/api/adminUsers";
import {
  getAllEvents,
  approveEvent,
  declineEvent,
  deleteEvent,
} from "@/lib/api/adminEvents";
import { getVenues, createVenue } from "@/lib/api/venues";
import { useNotifications } from "@/contexts/NotificationContext";
import VenueForm from "@/components/VenueForm";

interface UserItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: "user" | "admin";
  phoneNumber?: string;
  profilePicture?: string;
}

interface EventItem {
  adminProposedBudget: any;
  budgetStatus: string;
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'pending' | 'approved' | 'declined';
  organizer: {
    _id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  adminNotes?: string;
}

const initialFormState: AdminUserPayload = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
  phoneNumber: "",
  image: null,
};

export default function AdminDashboardPage() {
    const [showVenueModal, setShowVenueModal] = useState(false);
  const router = useRouter();
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AdminUserPayload>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'venues'>('users');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);

  // Venues state
  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venuesError, setVenuesError] = useState("");

  const buttonLabel = useMemo(
    () => (editingId ? "Update User" : "Create User"),
    [editingId]
  );

  const handleLogout = () => {
    logout();
    clearAuthCookiesClient();
    router.push("/login");
  };

  const loadUsers = async (page: number = currentPage) => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers(page, pageSize);
      console.log('getAllUsers response:', response);
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalUsers(response.pagination?.totalUsers || 0);
      setCurrentPage(page);
    } catch (err: unknown) {
      console.error('getAllUsers error:', err);
      if (err instanceof Error) {
        setError(err.message || "Failed to load users");
      } else {
        setError("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };
  const loadVenues = async () => {
    setVenuesLoading(true);
    setVenuesError("");
    try {
      const data = await getVenues(); // Calls GET /venues
      setVenues(data || []);
    } catch (err: any) {
      setVenuesError(err.message || "Failed to load venues");
    } finally {
      setVenuesLoading(false);
    }
  };

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    const userDataStr = document.cookie.split('; ').find(row => row.startsWith('user_data='))?.split('=')[1];
    if (!token) {
      clearAuthCookiesClient();
      router.push('/auth/login');
      return;
    }
    let user;
    try {
      user = userDataStr ? JSON.parse(decodeURIComponent(userDataStr)) : null;
    } catch {
      user = null;
    }
    if (!user || user.role !== 'admin') {
      clearAuthCookiesClient();
      router.push('/home');
      return;
    }
  }, [router]);

  useEffect(() => {
    loadUsers(1);
    loadEvents();
    loadVenues();
  }, []);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await getAllEvents();
      setEvents(response.data || []);
    } catch (err: unknown) {
      console.error('getAllEvents error:', err);
      if (err instanceof Error) {
        setError(err.message || "Failed to load events");
      } else {
        setError("Failed to load events");
      }
    } finally {
      setEventsLoading(false);
    }
  };

        {activeTab === 'venues' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Venues</h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(true)}
                  className="px-6 py-2 bg-rose-900 text-white rounded-lg text-sm font-semibold hover:bg-rose-800 transition-colors"
                >
                  + Create Venue
                </button>
                <button
                  type="button"
                  onClick={loadVenues}
                  className="px-4 py-2 text-sm text-rose-900 hover:underline"
                >
                  Refresh
                </button>
              </div>
            </div>
            {venuesError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {venuesError}
              </div>
            )}
            {venuesLoading ? (
              <p className="text-sm text-gray-600">Loading venues...</p>
            ) : venues.length === 0 ? (
              <p className="text-sm text-gray-600">No venues found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">City</th>
                      <th className="pb-2">Capacity</th>
                      <th className="pb-2">Contact</th>
                      <th className="pb-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((venue) => (
                      <tr key={venue._id} className="border-t border-gray-100">
                        <td className="py-3 font-medium">{venue.name}</td>
                        <td className="py-3">{venue.city}</td>
                        <td className="py-3">{venue.capacity}</td>
                        <td className="py-3 text-xs text-gray-600">{venue.contactPerson} {venue.contactEmail}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${venue.isPublic ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                            {venue.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Venue Modal */}
            {showVenueModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Create Venue</h2>
                    <button
                      type="button"
                      onClick={() => setShowVenueModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <VenueForm
                      onCancel={() => setShowVenueModal(false)}
                      onSave={async (data: any) => {
                        await createVenue(data);
                        setShowVenueModal(false);
                        loadVenues();
                        toast.success('Venue created successfully!');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
  const handleDeclineEvent = async (eventId: string, adminNotes?: string) => {
    try {
      await declineEvent(eventId, adminNotes);
      await loadEvents(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to decline event:', error);
    }
  };
  // ...existing code...

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      await loadEvents(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event: ' + (error.message || 'Unknown error'));
    }
  };

  const handleChange = (field: keyof AdminUserPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setImagePreview("");
    setShowModal(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingId) {
        await updateUser(editingId, formData);
      } else {
        await createUser(formData);
      }
      resetForm();
      await loadUsers(currentPage);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to save user");
      } else {
        setError("Failed to save user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadUsers(page);
    }
  };

  const handleEdit = (user: UserItem) => {
    setEditingId(user._id);
    setFormData({
      ...initialFormState,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "user",
      phoneNumber: user.phoneNumber || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    setError("");
    try {
      await deleteUser(userId);
      await loadUsers(currentPage);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to delete user");
      } else {
        setError("Failed to delete user");
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ...existing code...

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-gray-900">
      <header className="px-8 py-8 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-900 to-rose-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Manage users, events, and venues</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={toggleNotifications}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              notificationsEnabled 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L3 21l1.868-8.317z" />
            </svg>
            <span className="hidden sm:inline">{notificationsEnabled ? 'Notifications On' : 'Off'}</span>
          </button>
          <Link href="/home" className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <section className="px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H6v-2z" />
            </svg>
            Users
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'venues'
                ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Venues
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Users</h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => loadUsers()}
                  className="px-4 py-2 text-sm text-rose-900 hover:underline"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-6 py-2 bg-rose-900 text-white rounded-lg text-sm font-semibold hover:bg-rose-800 transition-colors"
                >
                  + Create User
                </button>
              </div>
            </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {user.profilePicture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${user.profilePicture}`}
                                alt={user.firstName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-rose-900">
                                {user.firstName?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3 capitalize">{user.role}</td>
                      <td className="py-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="text-rose-900 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {users.length} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Venues Tab */}
        {activeTab === 'venues' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Venue Management</h2>
              <div className="flex gap-3">
                <Link href="/admin/venues?createvenues" className="px-4 py-2 bg-rose-900 text-white rounded-lg text-sm font-semibold hover:bg-rose-800 transition-colors">
                  Create Venues
                </Link>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Quick access to venue CRUD and listings.</p>
            {venuesError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {venuesError}
              </div>
            )}
            {venuesLoading ? (
              <p className="text-sm text-gray-600">Loading venues...</p>
            ) : venues.length === 0 ? (
              <p className="text-sm text-gray-600">No venues found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">City</th>
                      <th className="pb-2">Capacity</th>
                      <th className="pb-2">Contact</th>
                      <th className="pb-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((venue) => (
                      <tr key={venue._id} className="border-t border-gray-100">
                        <td className="py-3 font-medium">{venue.name}</td>
                        <td className="py-3">{venue.city}</td>
                        <td className="py-3">{venue.capacity}</td>
                        <td className="py-3 text-xs text-gray-600">{venue.contactPerson} {venue.contactEmail}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${venue.isPublic ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                            {venue.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Event Management</h2>
              <button
                type="button"
                onClick={loadEvents}
                className="px-4 py-2 text-sm text-rose-900 hover:underline"
              >
                Refresh
              </button>
            </div>

            {eventsLoading ? (
              <p className="text-sm text-gray-600">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-gray-600">No events found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="pb-2">Event</th>
                      <th className="pb-2">Organizer</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id} className="border-t border-gray-100">
                        <td className="py-3">
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-xs text-gray-500">{event.category} • {event.location}</div>
                            {event.description && (
                              <div className="text-xs text-gray-600 mt-1 max-w-xs truncate">
                                {event.description.length > 50 ? `${event.description.substring(0, 50)}...` : event.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="font-medium">
                              {event.organizer.firstName} {event.organizer.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{event.organizer.email}</div>
                          </div>
                        </td>
                        <td className="py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'approved' ? 'bg-green-100 text-green-800' :
                            event.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : "Unknown"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="text-xs text-gray-600">
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(event.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2 flex-wrap">
                            {event.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveEvent(event._id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDeclineEvent(event._id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Decline
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all flex items-center gap-1"
                              title="Delete Event"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{buttonLabel}</h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <select
                  value={formData.role || "user"}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword || ""}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  {formData.image && (
                    <div className="text-xs text-gray-600">
                      Selected: {formData.image.name}
                    </div>
                  )}
                  {imagePreview && (
                    <div className="flex justify-center">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-rose-900 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : buttonLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
    </main>
  );
}
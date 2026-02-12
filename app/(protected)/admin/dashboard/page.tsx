"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
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
  proposeBudget,
} from "@/lib/api/adminEvents";

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
  // Budget fields
  proposedBudget?: number;
  adminProposedBudget?: number;
  finalBudget?: number;
  budgetStatus: 'pending' | 'negotiating' | 'accepted' | 'rejected';
  budgetNegotiationHistory?: Array<{
    proposer: 'user' | 'admin';
    proposerId?: string;
    amount: number;
    message?: string; 
    timestamp: string;
  }>;
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
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AdminUserPayload>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedEventForBudget, setSelectedEventForBudget] = useState<EventItem | null>(null);
  const [budgetProposalData, setBudgetProposalData] = useState({
    proposedBudget: '',
    message: ''
  });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);

  const buttonLabel = useMemo(
    () => (editingId ? "Update User" : "Create User"),
    [editingId]
  );

  const handleLogout = () => {
    logout();
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

  useEffect(() => {
    loadUsers(1);
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await getAllEvents();
      setEvents(response.data || []);
    } catch (error: any) {
      console.error('Failed to load events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      await approveEvent(eventId);
      await loadEvents(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to approve event:', error);
    }
  };

  const handleDeclineEvent = async (eventId: string, adminNotes?: string) => {
    try {
      await declineEvent(eventId, adminNotes);
      await loadEvents(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to decline event:', error);
    }
  };
  const handleProposeBudget = async (eventId: string, proposedBudget: number, message?: string) => {
    try {
      await proposeBudget(eventId, { proposedBudget, message });
      await loadEvents(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to propose budget:', error);
    }
  };
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

  return (
    <main className="min-h-screen bg-slate-50 text-gray-900">
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Manage users and event approvals</p>
        </div>
        <div className="flex gap-4">
          <Link href="/home" className="text-sm text-rose-900 hover:underline">
            ← Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-rose-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-rose-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Event Approvals
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow p-6">
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

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl shadow p-6">
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
                      <th className="pb-2">Budget</th>
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
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.budgetStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              event.budgetStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              event.budgetStatus === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.budgetStatus.charAt(0).toUpperCase() + event.budgetStatus.slice(1)}
                            </span>
                            {event.finalBudget && (
                              <span className="text-xs font-semibold text-purple-600">
                                ${event.finalBudget.toLocaleString()}
                              </span>
                            )}
                          </div>
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
                            {(event.budgetStatus === 'pending' || event.budgetStatus === 'negotiating') && (
                              <button
                                onClick={() => {
                                  setSelectedEventForBudget(event);
                                  setBudgetProposalData({
                                    proposedBudget: event.adminProposedBudget?.toString() || '',
                                    message: ''
                                  });
                                  setShowBudgetModal(true);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                                title={event.budgetStatus === 'pending' ? 'Propose Budget' : 'View Chat'}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {event.budgetStatus === 'pending' ? 'Propose' : 'Chat'}
                              </button>
                            )}
                            {event.status === 'pending' && event.budgetStatus === 'accepted' && (
                              <button
                                onClick={() => handleApproveEvent(event._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDeclineEvent(event._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
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

      {/* Budget Conversation Modal */}
      {showBudgetModal && selectedEventForBudget && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Budget Conversation</h3>
                    <p className="text-sm text-gray-600">{selectedEventForBudget.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedEventForBudget.budgetStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                    selectedEventForBudget.budgetStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedEventForBudget.budgetStatus === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEventForBudget.budgetStatus ? selectedEventForBudget.budgetStatus.charAt(0).toUpperCase() + selectedEventForBudget.budgetStatus.slice(1) : 'Unknown'}
                  </span>
                  <button
                    onClick={() => setShowBudgetModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Messaging Interface */}
                <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    {/* Initial User Proposal */}
                    {selectedEventForBudget.proposedBudget && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="bg-green-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                            <div className="text-sm text-green-600 font-medium mb-2">User Initial Proposal</div>
                            <div className="text-xl font-bold text-green-800">${selectedEventForBudget.proposedBudget.toLocaleString()}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-2">Event creation</div>
                        </div>
                      </div>
                    )}

                    {/* Admin Counter */}
                    {selectedEventForBudget.adminProposedBudget && (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="flex-1 flex justify-end">
                          <div className="bg-red-100 rounded-2xl rounded-tr-md px-4 py-3 max-w-md">
                            <div className="text-sm text-red-600 font-medium mb-2">Your Counter-Proposal</div>
                            <div className="text-xl font-bold text-red-800">${selectedEventForBudget.adminProposedBudget.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Final Budget */}
                    {selectedEventForBudget.finalBudget && (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 flex justify-end">
                          <div className="bg-purple-100 rounded-2xl rounded-tr-md px-4 py-3 max-w-md">
                            <div className="text-sm text-purple-600 font-medium mb-2">Final Agreement</div>
                            <div className="text-xl font-bold text-purple-800">${selectedEventForBudget.finalBudget.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Negotiation History */}
                    {selectedEventForBudget.budgetNegotiationHistory && selectedEventForBudget.budgetNegotiationHistory.length > 0 && (
                      <>
                        {selectedEventForBudget.budgetNegotiationHistory
                          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                          .map((item, index) => (
                          <div key={index} className={`flex items-start gap-3 ${item.proposer === 'admin' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              item.proposer === 'admin' ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                              {item.proposer === 'admin' ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                            </div>
                            <div className={`flex-1 ${item.proposer === 'admin' ? 'flex justify-end' : ''}`}>
                              <div className={`rounded-2xl px-4 py-3 max-w-md ${
                                item.proposer === 'admin'
                                  ? 'bg-red-100 rounded-tr-md'
                                  : 'bg-green-100 rounded-tl-md'
                              }`}>
                                <div className={`text-sm font-medium mb-2 ${
                                  item.proposer === 'admin' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {item.proposer === 'admin' ? 'Your Counter-Proposal' : 'User Counter-Proposal'}
                                </div>
                                <div className={`text-xl font-bold ${
                                  item.proposer === 'admin' ? 'text-red-800' : 'text-green-800'
                                }`}>
                                  ${item.amount.toLocaleString()}
                                </div>
                                {item.message && (
                                  <div className={`text-sm mt-3 p-3 rounded-lg ${
                                    item.proposer === 'admin' ? 'bg-red-200' : 'bg-green-200'
                                  }`}>
                                    "{item.message}"
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs text-gray-500 mt-1 ${
                                item.proposer === 'admin' ? 'text-right mr-2' : 'ml-2'
                              }`}>
                                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedEventForBudget.budgetStatus === 'pending' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Propose Budget ($)
                        </label>
                        <input
                          type="number"
                          value={budgetProposalData.proposedBudget}
                          onChange={(e) => setBudgetProposalData(prev => ({ ...prev, proposedBudget: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter proposed budget"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message (Optional)
                        </label>
                        <textarea
                          value={budgetProposalData.message}
                          onChange={(e) => setBudgetProposalData(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add a message explaining the budget proposal..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowBudgetModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  {(selectedEventForBudget.budgetStatus === 'pending' || selectedEventForBudget.budgetStatus === 'negotiating') && (
                    <button
                      onClick={async () => {
                        if (!budgetProposalData.proposedBudget) return;

                        await handleProposeBudget(
                          selectedEventForBudget._id,
                          parseFloat(budgetProposalData.proposedBudget),
                          budgetProposalData.message || undefined
                        );
                        setShowBudgetModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {selectedEventForBudget.adminProposedBudget ? 'Update Proposal' : 'Send Proposal'}
                    </button>
                  )}
                  {selectedEventForBudget.budgetStatus === 'negotiating' && (
                    <div className="flex gap-2 flex-1">
                      <button
                        onClick={() => handleApproveEvent(selectedEventForBudget._id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Event
                      </button>
                      <button
                        onClick={() => handleDeclineEvent(selectedEventForBudget._id)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Decline Event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
    </main>
  );
}
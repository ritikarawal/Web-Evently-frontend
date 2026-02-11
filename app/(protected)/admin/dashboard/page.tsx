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
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'approved' ? 'bg-green-100 text-green-800' :
                            event.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Organizer: {event.organizer.firstName} {event.organizer.lastName} ({event.organizer.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          Category: {event.category} | Location: {event.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                        {/* Budget Information */}
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-800">Budget Information</p>
                          {event.proposedBudget && (
                            <p className="text-sm text-blue-700">
                              User Proposed: ${event.proposedBudget}
                            </p>
                          )}
                          {event.adminProposedBudget && (
                            <p className="text-sm text-blue-700">
                              Admin Proposed: ${event.adminProposedBudget}
                            </p>
                          )}
                          {event.finalBudget && (
                            <p className="text-sm text-green-700 font-medium">
                              Final Budget: ${event.finalBudget}
                            </p>
                          )}
                          <p className="text-xs text-blue-600">
                            Status: {event.budgetStatus.charAt(0).toUpperCase() + event.budgetStatus.slice(1)}
                          </p>
                          {event.budgetNegotiationHistory && event.budgetNegotiationHistory.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-blue-800">Negotiation History:</p>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {event.budgetNegotiationHistory.map((item, index) => (
                                  <div key={index} className="text-xs bg-white p-2 rounded border">
                                    <div className="flex justify-between items-start">
                                      <span className={`font-medium ${item.proposer === 'admin' ? 'text-red-600' : 'text-green-600'}`}>
                                        {item.proposer === 'admin' ? 'Admin' : 'User'}:
                                      </span>
                                      <span className="text-gray-500">
                                        {new Date(item.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-800">Amount: ${item.amount}</p>
                                    {item.message && (
                                      <p className="text-gray-600 italic">"{item.message}"</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {event.status === 'pending' && event.budgetStatus === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedEventForBudget(event);
                              setBudgetProposalData({ proposedBudget: '', message: '' });
                              setShowBudgetModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Propose Budget
                          </button>
                        )}
                        {event.status === 'pending' && event.budgetStatus === 'accepted' && (
                          <button
                            onClick={() => handleApproveEvent(event._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Approve Event
                          </button>
                        )}
                        <button
                          onClick={() => handleDeclineEvent(event._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    )}
                    {event.adminNotes && (
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Admin Notes:</strong> {event.adminNotes}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(event.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
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

      {/* Budget Proposal Modal */}
      {showBudgetModal && selectedEventForBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Propose Budget for Event</h3>
            <p className="text-sm text-gray-600 mb-4">
              Event: {selectedEventForBudget.title}
            </p>
            {selectedEventForBudget.proposedBudget && (
              <p className="text-sm text-blue-600 mb-4">
                User proposed budget: ${selectedEventForBudget.proposedBudget}
              </p>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Budget ($)
                </label>
                <input
                  type="number"
                  value={budgetProposalData.proposedBudget}
                  onChange={(e) => setBudgetProposalData(prev => ({ ...prev, proposedBudget: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter proposed budget"
                  step="0.01"
                  required
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
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
    </main>
  );
}
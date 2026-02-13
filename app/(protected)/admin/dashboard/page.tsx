"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
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
  acceptUserBudgetProposal,
} from "@/lib/api/adminEvents";
import { getEventById } from "@/lib/api/events";
import { useNotifications } from "@/contexts/NotificationContext";

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
  const { notificationsEnabled, toggleNotifications } = useNotifications();
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

  // Refresh selected event data when budget modal is open
  useEffect(() => {
    if (showBudgetModal && selectedEventForBudget) {
      const interval = setInterval(() => {
        refreshSelectedEvent(selectedEventForBudget._id);
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [showBudgetModal, selectedEventForBudget]);

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

  const handleAcceptUserBudgetProposal = async (eventId: string) => {
    try {
      await acceptUserBudgetProposal(eventId);
      await loadEvents(); // Refresh the list
      setSelectedEventForBudget(null); // Close the modal
      toast.success('User budget proposal accepted successfully!');
    } catch (error: any) {
      console.error('Failed to accept user budget proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept user budget proposal';
      toast.error(errorMessage);
    }
  };

  const refreshSelectedEvent = async (eventId: string) => {
    try {
      const response = await getEventById(eventId);
      if (response.data) {
        setSelectedEventForBudget(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh event data:', error);
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
          <button
            onClick={toggleNotifications}
            className={`text-sm hover:underline flex items-center gap-1 ${
              notificationsEnabled ? 'text-blue-600' : 'text-gray-500'
            }`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L3 21l1.868-8.317z" />
            </svg>
            {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
          </button>
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
                          <div className="space-y-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.budgetStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              event.budgetStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              event.budgetStatus === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                event.budgetStatus === 'accepted' ? 'bg-green-500' :
                                event.budgetStatus === 'rejected' ? 'bg-red-500' :
                                event.budgetStatus === 'negotiating' ? 'bg-yellow-500 animate-pulse' :
                                'bg-gray-500'
                              }`}></span>
                              {event.budgetStatus.charAt(0).toUpperCase() + event.budgetStatus.slice(1)}
                            </div>
                            {event.finalBudget && (
                              <div className="text-sm font-semibold text-purple-600">
                                ${event.finalBudget.toLocaleString()}
                              </div>
                            )}
                            {event.adminProposedBudget && !event.finalBudget && (
                              <div className="text-xs text-blue-600">
                                Your offer: ${event.adminProposedBudget.toLocaleString()}
                              </div>
                            )}
                            {event.proposedBudget && !event.finalBudget && (
                              <div className="text-xs text-green-600">
                                User asked: ${event.proposedBudget.toLocaleString()}
                              </div>
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
                                onClick={async () => {
                                  // Refresh event data before opening modal
                                  await refreshSelectedEvent(event._id);
                                  setSelectedEventForBudget(event);
                                  setBudgetProposalData({
                                    proposedBudget: event.adminProposedBudget?.toString() || '',
                                    message: ''
                                  });
                                  setShowBudgetModal(true);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                                title={event.budgetStatus === 'pending' ? 'Start Budget Negotiation' : 'Continue Budget Discussion'}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {event.budgetStatus === 'pending' ? 'Start Chat' : 'View Chat'}
                              </button>
                            )}
                            {event.status === 'pending' && (
                              <button
                                onClick={() => handleApproveEvent(event._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {event.status === 'pending' && (
                              <button
                                onClick={() => handleDeclineEvent(event._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Decline
                              </button>
                            )}
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

      {/* Budget Management Modal */}
      {showBudgetModal && selectedEventForBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Budget Management</h2>
                    <p className="text-blue-100">{selectedEventForBudget.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEventForBudget.budgetStatus === 'accepted' ? 'bg-green-500 text-white' :
                      selectedEventForBudget.budgetStatus === 'rejected' ? 'bg-red-500 text-white' :
                      selectedEventForBudget.budgetStatus === 'negotiating' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      <span className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></span>
                      {selectedEventForBudget.budgetStatus?.charAt(0).toUpperCase() + selectedEventForBudget.budgetStatus?.slice(1)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBudgetModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
              {/* Budget Overview Panel */}
              <div className="lg:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Overview</h3>

                <div className="space-y-4">
                  {/* Current Budgets */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Current Proposals</h4>
                    <div className="space-y-3">
                      {selectedEventForBudget.proposedBudget && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">User Proposal</span>
                          <span className="font-semibold text-green-600">${selectedEventForBudget.proposedBudget.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedEventForBudget.adminProposedBudget && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Your Proposal</span>
                          <span className="font-semibold text-blue-600">${selectedEventForBudget.adminProposedBudget.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedEventForBudget.finalBudget && (
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="text-sm font-medium text-gray-800">Final Budget</span>
                          <span className="font-bold text-purple-600 text-lg">${selectedEventForBudget.finalBudget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">💰 All amounts shown are the full budget values as agreed (no VAT, fees, or deductions applied)</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Negotiation Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Messages</span>
                        <span className="font-medium">{selectedEventForBudget.budgetNegotiationHistory?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Activity</span>
                        <span className="font-medium">
                          {selectedEventForBudget.budgetNegotiationHistory?.length ?
                            new Date(selectedEventForBudget.budgetNegotiationHistory[selectedEventForBudget.budgetNegotiationHistory.length - 1].timestamp).toLocaleDateString() :
                            'None'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Panel */}
                  {(selectedEventForBudget.budgetStatus === 'pending' || selectedEventForBudget.budgetStatus === 'negotiating') && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Quick Actions</h4>
                      {selectedEventForBudget.status !== 'pending' && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Event status changed to {selectedEventForBudget.status}. Budget actions are no longer available.
                        </div>
                      )}
                      <div className="space-y-2">
                        {selectedEventForBudget.budgetStatus === 'negotiating' && selectedEventForBudget.proposedBudget && selectedEventForBudget.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptUserBudgetProposal(selectedEventForBudget._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Accept User's Proposal (${selectedEventForBudget.proposedBudget.toLocaleString()})
                          </button>
                        )}
                        {selectedEventForBudget.status === 'pending' && (
                          <button
                            onClick={() => handleApproveEvent(selectedEventForBudget._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve Event
                          </button>
                        )}
                        {selectedEventForBudget.status === 'pending' && (
                          <button
                            onClick={() => handleDeclineEvent(selectedEventForBudget._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Decline Event
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Negotiation Timeline */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Negotiation Timeline</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <strong>Important:</strong> All budget amounts shown are the exact values entered by users/admins. No VAT, taxes, fees, or deductions are automatically applied.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Initial User Proposal */}
                    {selectedEventForBudget.proposedBudget && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="w-0.5 h-16 bg-gray-200"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-green-800">User Initial Proposal</span>
                              <span className="text-sm text-gray-500">Event creation</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-2">${selectedEventForBudget.proposedBudget.toLocaleString()}</div>
                            <p className="text-sm text-gray-600">User requested this budget for the event</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Negotiation History */}
                    {selectedEventForBudget.budgetNegotiationHistory
                      ?.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.proposer === 'admin' ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                              {item.proposer === 'admin' ? (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                            </div>
                            {index < (selectedEventForBudget.budgetNegotiationHistory?.length || 0) - 1 && (
                              <div className="w-0.5 h-16 bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className={`border rounded-lg p-4 ${
                              item.proposer === 'admin'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium ${
                                  item.proposer === 'admin' ? 'text-blue-800' : 'text-green-800'
                                }`}>
                                  {item.proposer === 'admin' ? 'Your Counter-Proposal' : 'User Counter-Proposal'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <div className={`text-2xl font-bold mb-2 ${
                                item.proposer === 'admin' ? 'text-blue-600' : 'text-green-600'
                              }`}>
                                ${item.amount.toLocaleString()}
                              </div>
                              {item.message && (
                                <div className={`text-sm p-3 rounded-lg ${
                                  item.proposer === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  "{item.message}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Final Agreement */}
                    {selectedEventForBudget.finalBudget && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-purple-800">Final Agreement</span>
                              <span className="text-sm text-gray-500">Budget Accepted</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">${selectedEventForBudget.finalBudget.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget Proposal Form */}
                {(selectedEventForBudget.budgetStatus === 'pending' || selectedEventForBudget.budgetStatus === 'negotiating') && (
                  <div className="bg-gray-50 rounded-lg p-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      {selectedEventForBudget.adminProposedBudget ? 'Update Your Proposal' : 'Make a Budget Proposal'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proposed Budget Amount ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={budgetProposalData.proposedBudget}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow positive numbers
                              if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                                setBudgetProposalData(prev => ({ ...prev, proposedBudget: value }));
                              }
                            }}
                            className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter the full budget amount (no VAT, fees, or deductions will be applied)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message (Optional)
                        </label>
                        <textarea
                          value={budgetProposalData.message}
                          onChange={(e) => setBudgetProposalData(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Explain your budget proposal..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowBudgetModal(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const amount = parseFloat(budgetProposalData.proposedBudget);
                          if (!budgetProposalData.proposedBudget || isNaN(amount) || amount <= 0) {
                            alert('Please enter a valid positive budget amount greater than $0.00');
                            return;
                          }

                          await handleProposeBudget(
                            selectedEventForBudget._id,
                            amount,
                            budgetProposalData.message || undefined
                          );
                          setShowBudgetModal(false);
                        }}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {selectedEventForBudget.adminProposedBudget ? 'Update Proposal' : 'Send Proposal'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
    </main>
  );
}
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
  getPendingEvents,
  approveEvent,
  declineEvent,
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
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const buttonLabel = useMemo(
    () => (editingId ? "Update User" : "Create User"),
    [editingId]
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers();
      console.log('getAllUsers response:', response);
      setUsers(response.data || []);
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
    loadUsers();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await getPendingEvents();
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
      await loadUsers();
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
      await loadUsers();
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
                  onClick={loadUsers}
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
        </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Pending Event Approvals</h2>
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
              <p className="text-sm text-gray-600">No pending events found.</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          Organizer: {event.organizer.firstName} {event.organizer.lastName} ({event.organizer.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          Category: {event.category} | Location: {event.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveEvent(event._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeclineEvent(event._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
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
    </section>
    </main>
  );
}
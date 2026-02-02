"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AdminUserPayload,
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/lib/api/adminUsers";

interface UserItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: "user" | "admin";
  phoneNumber?: string;
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
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AdminUserPayload>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const buttonLabel = useMemo(
    () => (editingId ? "Update User" : "Create User"),
    [editingId]
  );

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (err: unknown) {
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
  }, []);

  const handleChange = (field: keyof AdminUserPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
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
  };

  const handleDelete = async (userId: string) => {
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

  return (
    <main className="min-h-screen bg-slate-50 text-gray-900">
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Manage users and roles</p>
        </div>
        <Link href="/home" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 py-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{buttonLabel}</h2>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <select
                  value={formData.role || "user"}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword || ""}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-rose-900 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : buttonLabel}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Users</h2>
              <button
                type="button"
                onClick={loadUsers}
                className="text-sm text-rose-900 hover:underline"
              >
                Refresh
              </button>
            </div>

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
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3 capitalize">{user.role}</td>
                        <td className="py-3">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              className="text-rose-900 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user._id)}
                              className="text-red-600 hover:underline"
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
        </div>
      </section>
    </main>
  );
}

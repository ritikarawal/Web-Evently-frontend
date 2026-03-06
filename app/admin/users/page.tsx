"use client";


import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, updateUser } from "@/lib/api/adminUsers";
import CreateUserForm from "./CreateUserForm";
import { EditIcon, DeleteIcon } from "@/components/AdminIcon";
import EditUserForm from "./EditUserForm";

export default function AdminUsersPage() {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const fetchUsers = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(pageNum, PAGE_SIZE);
      const userList = Array.isArray(data) ? data : data.data || data.users || [];
      setUsers(userList);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    }
  };

  const handleEditStart = (user: any) => {
    setEditId(user._id);
    setEditData({ ...user });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await updateUser(editId!, editData);
      setEditId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to update user");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const [showCreate, setShowCreate] = useState(false);

  // Modern UI colors
  const tableHeader = "py-3 px-4 text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200";
  const tableCell = "py-3 px-4 text-sm text-gray-900 border-b border-gray-100";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#800000] mb-4">Admin Users</h1>
      <div className="bg-white/80 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-gray-900">Create User</h2>
          {!showCreate && (
            <button
              className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform"
              onClick={() => setShowCreate(true)}
            >
              + New User
            </button>
          )}
        </div>
        {showCreate && (
          <div className="mb-2">
            <CreateUserForm
              onSuccess={() => {
                setShowCreate(false);
                fetchUsers(1);
                setPage(1);
              }}
            />
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mt-2 hover:bg-gray-400"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="bg-white/80 rounded-2xl shadow-xl p-8 border border-gray-200">
        {editId ? (
          <EditUserForm
            user={users.find(u => u._id === editId)}
            onSuccess={() => {
              setEditId(null);
              fetchUsers(page);
            }}
            onCancel={() => setEditId(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900">User List</h2>
              <div className="flex gap-2 items-center">
                <button
                  className="px-3 py-1 rounded bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="text-gray-700 text-sm">Page {page} of {totalPages}</span>
                <button
                  className="px-3 py-1 rounded bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-gray-700">Loading users...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl">
                  <thead>
                    <tr>
                      <th className={tableHeader}>First Name</th>
                      <th className={tableHeader}>Last Name</th>
                      <th className={tableHeader}>Email</th>
                      <th className={tableHeader}>Username</th>
                      <th className={tableHeader}>Phone</th>
                      <th className={tableHeader}>Role</th>
                      <th className={tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className={tableCell}>{user.firstName}</td>
                        <td className={tableCell}>{user.lastName}</td>
                        <td className={tableCell}>{user.email}</td>
                        <td className={tableCell}>{user.username}</td>
                        <td className={tableCell}>{user.phoneNumber}</td>
                        <td className={tableCell}>{user.role}</td>
                        <td className={tableCell + " flex gap-2 items-center"}>
                          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full" onClick={() => handleEditStart(user)}><EditIcon className="w-5 h-5" /></button>
                          <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full" onClick={() => handleDelete(user._id)}><DeleteIcon className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

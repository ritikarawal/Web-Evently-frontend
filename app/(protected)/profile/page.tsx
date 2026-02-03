"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, logout, updateProfile, updateProfilePicture } from "@/lib/api/auth";

interface ProfileData {
  _id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>("");
  const [editSuccess, setEditSuccess] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadError("");
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      await updateProfilePicture(selectedFile);
      const response = await getProfile();
      setProfile(response.data);
      setSelectedFile(null);
      setImagePreview("");
      setShowUploadForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload photo";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setImagePreview("");
    setUploadError("");
    setShowUploadForm(false);
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        if (isMounted) {
          setProfile(response.data);
          setFormData((prev) => ({
            ...prev,
            firstName: response.data?.firstName || "",
            lastName: response.data?.lastName || "",
            username: response.data?.username || "",
            email: response.data?.email || "",
            phoneNumber: response.data?.phoneNumber || "",
          }));
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to load profile";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setEditError("");
    setEditSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setEditError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};

      if (formData.firstName !== (profile?.firstName || "")) payload.firstName = formData.firstName;
      if (formData.lastName !== (profile?.lastName || "")) payload.lastName = formData.lastName;
      if (formData.username !== (profile?.username || "")) payload.username = formData.username;
      if (formData.email !== (profile?.email || "")) payload.email = formData.email;
      if (formData.phoneNumber !== (profile?.phoneNumber || "")) payload.phoneNumber = formData.phoneNumber;
      if (formData.password) payload.password = formData.password;

      const response = await updateProfile(payload);
      setProfile(response.data);
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setEditSuccess("Profile updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setEditError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <div className="flex gap-3">
            <Link 
              href="/home" 
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-rose-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-600">Loading...</p>
          </div>
        )}
        
        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && profile && (
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center overflow-hidden">
                    {profile.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${profile.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-semibold text-white">
                        {profile.firstName?.[0] || "U"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-rose-600 mt-1">@{profile.username}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.email}
                    </span>
                    {profile.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {profile.phoneNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-full">
                      {profile.role}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Photo Form */}
            {showUploadForm && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Profile Picture</h3>
                
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  {imagePreview && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{selectedFile?.name}</p>
                        <p className="text-gray-500">{((selectedFile?.size || 0) / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleUploadPhoto}
                      disabled={uploading || !selectedFile}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      onClick={handleCancelUpload}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit Profile</h3>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  {editSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                    placeholder="Username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                    placeholder="Phone number"
                  />
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                        placeholder="New password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
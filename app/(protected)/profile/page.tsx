"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, logout, updateProfilePicture } from "@/lib/api/auth";

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
      // Refresh profile to show new picture
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

  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
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
      <section className="px-12 pb-12">
        <div className="bg-white rounded-2xl shadow p-6">
          {loading && <p className="text-gray-700">Loading profile...</p>}
          {!loading && error && (
            <p className="text-red-600">{error}</p>
          )}
          {!loading && !error && profile && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full bg-rose-200 flex items-center justify-center overflow-hidden group cursor-pointer">
                    {profile.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${profile.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-rose-900">
                        {profile.firstName?.[0] || "U"}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="text-white text-xs font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-sm text-gray-600">@{profile.username}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-semibold">Email:</span> {profile.email}</p>
                  <p><span className="font-semibold">Role:</span> {profile.role}</p>
                  <p><span className="font-semibold">Phone:</span> {profile.phoneNumber || "N/A"}</p>
                  <p><span className="font-semibold">Joined:</span> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              {showUploadForm && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
                  
                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                      {uploadError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />

                    {imagePreview && (
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>File:</strong> {selectedFile?.name}</p>
                          <p><strong>Size:</strong> {((selectedFile?.size || 0) / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleUploadPhoto}
                        disabled={uploading || !selectedFile}
                        className="flex-1 bg-rose-900 hover:bg-rose-800 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition"
                      >
                        {uploading ? "Uploading..." : "Upload Photo"}
                      </button>
                      <button
                        onClick={handleCancelUpload}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api/auth";

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
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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
        <Link href="/home" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>
      <section className="px-12 pb-12">
        <div className="bg-white rounded-2xl shadow p-6">
          {loading && <p className="text-gray-700">Loading profile...</p>}
          {!loading && error && (
            <p className="text-red-600">{error}</p>
          )}
          {!loading && !error && profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-rose-200 flex items-center justify-center overflow-hidden">
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
          )}
        </div>
      </section>
    </main>
  );
}

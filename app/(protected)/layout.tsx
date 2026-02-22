"use client";


import Sidebar from "@/components/Sidebar";
import NavigationBar from "@/components/NavigationBar";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfilePicture(response.data?.profilePicture || null);
        setIsAdmin(response.data?.role === "admin");
      } catch (err) {
        setProfilePicture(null);
        setIsAdmin(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="fixed top-0 left-0 w-full h-16 z-30">
        <NavigationBar profilePicture={profilePicture} isAdmin={isAdmin} />
      </div>
      <div className="flex">
        <div className="w-64 mt-16">
          <Sidebar />
        </div>
        <main className="flex-1 p-6 md:p-10 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}

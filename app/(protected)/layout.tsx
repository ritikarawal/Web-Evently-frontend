"use client";

import Sidebar from "@/components/Sidebar";
import NavigationBar from "@/components/NavigationBar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // You can fetch profilePicture and isAdmin from context or props if needed
  const profilePicture = null; // Replace with actual user profile picture
  const isAdmin = false; // Replace with actual admin status

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

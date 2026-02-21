"use client";

import Sidebar from "@/components/Sidebar";
import NavigationBar from "@/components/NavigationBar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // You can fetch profilePicture and isAdmin from context or props if needed
  const profilePicture = null; // Replace with actual user profile picture
  const isAdmin = false; // Replace with actual admin status

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-20">
          <NavigationBar profilePicture={profilePicture} isAdmin={isAdmin} />
        </div>
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

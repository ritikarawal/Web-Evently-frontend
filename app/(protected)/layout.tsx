"use client";


import Sidebar from "@/components/Sidebar";
import NavigationBar from "@/components/NavigationBar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getProfile } from "@/lib/api/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/admin");

  const expandedWidth = 250;
  const collapsedWidth = 70;
  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth;

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

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-sidebar-collapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="fixed top-0 left-0 w-full h-16 z-30">
        <NavigationBar profilePicture={profilePicture} isAdmin={isAdmin} />
      </div>
      <div className="pt-16">
        {!hideSidebar && (
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
          />
        )}
        <main
          className="p-9 mt-4 transition-all duration-300 ease-in-out"
          style={{ marginLeft: hideSidebar ? 0 : `${sidebarWidth}px` }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

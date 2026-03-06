"use client";


import Sidebar from "@/components/Sidebar";
import NavigationBar from "@/components/NavigationBar";
import { useEffect, useState, isValidElement, cloneElement } from "react";
import dynamic from "next/dynamic";
// Dynamically import ChatBox to avoid SSR issues
const ChatBox = dynamic(() => import("@/components/ChatBox"), { ssr: false });
import { usePathname } from "next/navigation";
import { getProfile } from "@/lib/api/auth";

type HomePageProps = {
  sidebarOpen: boolean;
  [key: string]: any;
};

type HomePageElement = React.ReactElement<HomePageProps>;

export default function ProtectedLayout({ children }: { children: HomePageElement }) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/admin");

  const expandedWidth = 250;
  const collapsedWidth = 70;
  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth;
  // Listen for event creation flag in localStorage
  useEffect(() => {
    const checkChatFlag = () => {
      if (typeof window !== "undefined") {
        setShowChat(localStorage.getItem("event-created") === "true");
      }
    };
    checkChatFlag();
    window.addEventListener("storage", checkChatFlag);
    return () => window.removeEventListener("storage", checkChatFlag);
  }, []);

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
      {/* Header */}
      {!pathname.startsWith("/admin") && (
        <div className="fixed top-0 left-0 w-full h-16 z-30">
          <NavigationBar profilePicture={profilePicture} isAdmin={isAdmin} />
        </div>
      )}
      {/* Sidebar */}
      {!hideSidebar && (
        <div
          className="fixed left-0 z-20 h-full transition-all duration-300"
          style={{ top: '4rem', width: `${sidebarWidth}px` }}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
          />
        </div>
      )}
      {/* Main Content */}
      <main
        className="pt-16 p-9 mt-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: hideSidebar ? 0 : `${sidebarWidth}px` }}
      >
        {/* Force-inject sidebarOpen prop into HomePage if present */}
        {isValidElement(children) &&
          children.type &&
          (children.type as any).name === 'HomePage' &&
          'sidebarOpen' in (children.props as HomePageProps)
          ? cloneElement(children, { sidebarOpen: !isCollapsed })
          : children}
      </main>
      {/* ChatBox always visible for now (frontend test) */}
      <ChatBox />
    </div>
  );
}

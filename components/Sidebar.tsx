"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaCalendarAlt, FaBell, FaCog, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", href: "/home", icon: <FaHome />, color: "text-indigo-600" },
  { label: "My Events", href: "/my-events", icon: <FaCalendarAlt />, color: "text-purple-600" },
  { label: "Booked Events", href: "/booked-events", icon: <FaCalendarAlt />, color: "text-blue-600" },
  { label: "Notifications", href: "/notifications", icon: <FaBell />, color: "text-pink-600" },
  { label: "Profile", href: "/profile", icon: <FaUser />, color: "text-blue-600" },
  { label: "Settings", href: "/settings", icon: <FaCog />, color: "text-gray-600" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 w-64 mt-20 h-[calc(100vh-5rem)] bg-gradient-to-b from-gray-50 via-white to-gray-50 shadow-2xl flex flex-col py-6 px-4 z-30 border-r border-gray-200">
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 font-medium ${ pathname === item.href
              ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-600 shadow-md"
              : "text-gray-700 hover:bg-gray-100 hover:translate-x-1"
            }`}
          >
            <span className={`text-lg ${pathname === item.href ? 'text-indigo-600' : item.color} transition-colors`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Logout Button - More Accessible */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-200 w-full mt-auto font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-red-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        title="Click to logout from your account"
        aria-label="Logout button"
      >
        <FaSignOutAlt className="text-lg" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

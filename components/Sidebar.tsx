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
    <aside
      className="fixed left-0 top-[4.5rem] w-64 h-[calc(100vh-4.5rem)] shadow-2xl flex flex-col py-5 px-4 z-40 border-r bg-[var(--surface)] overflow-y-auto"
      style={{ borderColor: 'var(--border)' }}
    >
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 font-medium ${ pathname === item.href
              ? "shadow-md border-l-4"
              : "hover:bg-gray-100 hover:translate-x-1"
            }`}
            style={
              pathname === item.href
                ? { background: 'var(--primary-light)', color: 'var(--primary)', borderLeftColor: 'var(--primary)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            <span
              className="text-lg transition-colors"
              style={pathname === item.href ? { color: 'var(--primary)' } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t my-4" style={{ borderColor: 'var(--border)' }}></div>

      {/* Logout Button - More Accessible */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 px-5 py-3 rounded-xl w-full mt-auto font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ background: 'var(--primary)', color: 'var(--nav-selected)', borderColor: 'var(--primary-light)' }}
        title="Click to logout from your account"
        aria-label="Logout button"
      >
        <FaSignOutAlt className="text-lg" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

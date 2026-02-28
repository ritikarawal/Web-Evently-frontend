"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", href: "/home", icon: <FaHome /> },
  { label: "My Events", href: "/my-events", icon: <FaCalendarAlt /> },
  { label: "Booked Events", href: "/booked-events", icon: <FaCalendarAlt /> },
  { label: "Notifications", href: "/notifications", icon: <FaBell /> },
  { label: "Profile", href: "/profile", icon: <FaUser /> },
  { label: "Settings", href: "/settings", icon: <FaCog /> },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] shadow-2xl flex flex-col py-5 z-40 border-r bg-[var(--surface)] transition-all duration-300 ease-in-out ${
        isCollapsed ? "overflow-hidden" : "overflow-y-auto"
      } ${
        isCollapsed ? "w-[70px] px-2" : "w-[250px] px-4"
      }`}
      style={{ borderColor: 'var(--border)' }}
    >
      <button
        onClick={onToggle}
        className="mb-4 flex h-10 w-10 items-center justify-center self-end rounded-lg border transition-all duration-300 ease-in-out hover:bg-gray-100"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        aria-label="Toggle sidebar"
      >
        <FaChevronLeft
          className={`transition-all duration-300 ease-in-out ${
            isCollapsed ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center rounded-xl py-3 font-medium transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "justify-center px-0"
                : "justify-start gap-4 px-5"
            } ${
              pathname === item.href
                ? "shadow-md border-l-4"
                : "hover:bg-gray-100"
            }`}
            style={
              pathname === item.href
                ? { background: 'var(--primary-light)', color: 'var(--primary)', borderLeftColor: 'var(--primary)' }
                : { color: 'var(--text-secondary)' }
            }
            title={isCollapsed ? item.label : undefined}
          >
            <span
              className="text-lg transition-colors"
              style={pathname === item.href ? { color: 'var(--primary)' } : {}}
            >
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.label}</span>}

            {isCollapsed && (
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t my-4" style={{ borderColor: 'var(--border)' }}></div>

      <button
        onClick={handleLogout}
        className={`w-full mt-auto rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out ${
          isCollapsed
            ? "flex items-center justify-center"
            : "flex items-center justify-center gap-3 px-5"
        }`}
        style={{ background: 'var(--primary)', color: 'var(--nav-selected)', borderColor: 'var(--primary-light)' }}
        title="Click to logout from your account"
        aria-label="Logout button"
      >
        <FaSignOutAlt className="text-lg" />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}

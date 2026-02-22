"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCalendarAlt, FaBell, FaCog, FaPlus } from "react-icons/fa";

const navItems = [
  { label: "Home", href: "/home", icon: <FaHome /> },
  { label: "My Events", href: "/my-events", icon: <FaCalendarAlt /> },
  { label: "Notifications", href: "/notifications", icon: <FaBell /> },
  { label: "Settings", href: "/settings", icon: <FaCog /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
      <aside className="fixed left-0 w-64 mt-9 h-[calc(100vh-2.25rem)] bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-xl flex flex-col py-6 px-4 z-30">
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-white text-[var(--primary)]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
  );
}

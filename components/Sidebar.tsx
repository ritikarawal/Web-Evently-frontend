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
      <aside className="fixed left-0 w-64 mt-9 h-[calc(100vh-2.25rem)] bg-gradient-to-br from-[#b2455c] via-[#d16ba5] to-[#f8b6b6] flex flex-col py-6 px-4 z-30">
      {/* Logo / App Name */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-9 h-9 rounded-xl bg-white/30 flex items-center justify-center text-white font-bold text-xl">E</div>
        <span className="font-extrabold text-lg text-white tracking-tight">Evently</span>
      </div>
      {/* Create Event Button */}
      <Link href="/create-event" className="flex items-center gap-2 mb-8 px-4 py-3 bg-white/80 hover:bg-white text-[#d16ba5] rounded-xl font-semibold transition-all">
        <FaPlus className="w-4 h-4" />
        Create Event
      </Link>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === item.href
                ? "bg-white/80 text-[#d16ba5] font-semibold"
                : "text-white hover:bg-white/20"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

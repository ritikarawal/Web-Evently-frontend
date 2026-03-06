"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaComments } from "react-icons/fa";

const navItems = [
  { label: "Users", href: "/admin/users", icon: <FaUsers className="inline mr-2" /> },
  { label: "Events", href: "/admin/events", icon: <FaCalendarAlt className="inline mr-2" /> },
  { label: "Venues", href: "/admin/venues", icon: <FaMapMarkerAlt className="inline mr-2" /> },
  { label: "Chats", href: "/admin/chats", icon: <FaComments className="inline mr-2" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#fbeaea] to-[#fff0f0] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/60 shadow-2xl flex flex-col p-8 gap-4 rounded-tr-3xl rounded-br-3xl border-r border-gray-200" style={{backdropFilter:'blur(18px)'}}>
        <div className="flex items-center gap-3 mb-8">
          <img src="/evently logo.png" alt="Logo" className="w-10 h-10 rounded-xl shadow" />
          <span className="text-2xl font-extrabold text-[#800000] tracking-tight">Admin</span>
        </div>
        <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-lg transition-all duration-150 ${pathname === item.href ? 'bg-gradient-to-r from-[#800000] to-[#b30000] text-white shadow-lg scale-105' : 'hover:bg-[#800000]/10 text-[#800000]'}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="mt-auto text-xs text-gray-400 pt-8">© {new Date().getFullYear()} Evently Admin</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 bg-transparent min-h-screen">{children}</main>
    </div>
  );
}

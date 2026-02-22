"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

interface NavigationBarProps {
  profilePicture: string | null;
  isAdmin?: boolean;
}

export default function NavigationBar({ profilePicture, isAdmin = false }: NavigationBarProps) {
  const router = useRouter();
  const { unreadCount, refreshNotifications } = useNotifications();

  // Prepend API base URL if profilePicture is a relative path
  let profilePictureUrl = profilePicture;
  if (profilePicture && profilePicture.startsWith("/")) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    profilePictureUrl = baseUrl + profilePicture;
  }

  return (
    <header className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2">
            <Image
              src="/evently logo.png"
              alt="Evently Logo"
              width={55}
              height={55}
              className="object-contain"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <button className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/90 backdrop-blur-sm border-r border-[var(--primary)]/30 rounded-l-lg text-sm text-[var(--text-secondary)] font-medium hover:bg-white transition-colors duration-300">
              🏷️ Category
            </button>
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-32 pr-12 py-3 rounded-xl border border-white/30 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-[var(--text-secondary)] placeholder-[var(--text-secondary)]/60 transition-all duration-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-2 rounded-lg hover:from-[var(--primary-light)] hover:to-[var(--primary)] transition-all duration-300 hover:scale-110 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications and Profile */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              refreshNotifications();
              router.push('/notifications');
            }}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Profile Button */}
        <button
          onClick={() => router.push('/profile')}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 overflow-hidden border border-white/30"
        >
          {profilePictureUrl ? (
            <Image
              src={profilePictureUrl}
              alt="Profile"
              width={48}
              height={48}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </button>
        </div>
      </div>

      {/* Navigation Tabs removed as requested */}
    </header>
  );
}
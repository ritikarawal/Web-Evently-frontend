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
    <header
      style={{
        background: 'rgba(127,15,35,0.25)', // Rose-tinted glassy effect
        boxShadow: '0 4px 24px 0 rgba(127,15,35,0.10)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: '1.5px solid rgba(127,15,35,0.18)',
      }}
      className="shadow-2xl sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center group">
          <Image
            src="/evently logo.png"
            alt="Evently Logo"
            width={55}
            height={55}
            className="object-contain"
          />
          <span className="ml-3 font-bold text-white text-xl hidden sm:inline" style={{ color: 'var(--nav-selected)' }}>Evently</span>
        </div>



        {/* Notifications and Profile */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              refreshNotifications();
              router.push('/notifications');
            }}
            className="relative p-2 rounded-full hover:bg-white/20 transition-all duration-300 group"
            title="View notifications"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Profile Button */}
          <button
            onClick={() => router.push('/profile')}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white/30 overflow-hidden border-2 border-white/30"
            title="Go to profile"
            aria-label="User profile"
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
    </header>
  );
}
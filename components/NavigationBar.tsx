"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavigationBarProps {
  profilePicture: string | null;
}

export default function NavigationBar({ profilePicture }: NavigationBarProps) {
  const router = useRouter();

  return (
    <header className="bg-blue-600/90 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/evently logo.png"
            alt="Evently Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <button className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white border-r border-gray-300 rounded-l-lg text-sm text-gray-700 font-medium">
              🏷️ Category
            </button>
            <input
              type="text"
              placeholder="Search"
                className="w-full pl-32 pr-12 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile Button */}
        <button
          onClick={() => router.push('/profile')}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 overflow-hidden"
        >
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile"
              width={40}
              height={40}
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

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8 border-b border-blue-300/50">
          <Link href="/home" className="px-4 py-3 font-medium text-gray-800 border-b-2 border-blue-600">
            Events
          </Link>
          <Link href="/my-events" className="px-4 py-3 font-medium text-gray-700 hover:text-gray-900 transition-colors">
            My Events
          </Link>
          <Link href="/notifications" className="px-4 py-3 font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Notifications
          </Link>
          <Link href="/settings" className="px-4 py-3 font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Settings
          </Link>
        </div>
      </nav>
    </header>
  );
}
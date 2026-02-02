"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const eventCategories = [
    {
      name: "Birthday",
      icon: "🎂",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Anniversary",
      icon: "💕",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Wedding",
      icon: "👫",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Engagement",
      icon: "💍",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Workshop",
      icon: "👨‍💼",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Conference",
      icon: "🏛️",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Graduation",
      icon: "🎓",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    },
    {
      name: "Fundraisers",
      icon: "🎁",
      color: "bg-rose-100",
      hoverColor: "hover:bg-rose-200"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-300 via-rose-200 to-pink-100">
      {/* Header */}
      <header className="bg-rose-400/90 backdrop-blur-sm shadow-md">
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
                className="w-full pl-32 pr-12 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-600 text-white p-2 rounded-md hover:bg-rose-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Profile Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="font-medium text-gray-800">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 border-b border-rose-300/50">
            <button className="px-4 py-3 font-medium text-gray-800 border-b-2 border-gray-800">
              Events
            </button>
            <button className="px-4 py-3 font-medium text-gray-700 hover:text-gray-900 transition-colors">
              My Events
            </button>
            <button className="px-4 py-3 font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Notification
            </button>
            <button className="px-4 py-3 font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Settings
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventCategories.map((category, index) => (
            <Link
              key={category.name}
              href={`/events/${category.name.toLowerCase()}`}
              className={`${category.color} ${category.hoverColor} rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer`}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`
              }}
            >
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
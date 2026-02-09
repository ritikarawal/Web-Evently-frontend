"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProfile, logout } from "@/lib/api/auth";
import NavigationBar from "@/components/NavigationBar";
import { FaBirthdayCake, FaHeart, FaRing, FaGem, FaTools, FaMicrophone, FaGraduationCap, FaDonate } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (const rawCookie of cookies) {
      const cookie = rawCookie.trim();
      if (cookie.startsWith(nameEQ)) {
        const value = cookie.substring(nameEQ.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfilePicture = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

        const userDataRaw = getCookieValue("user_data");
        if (userDataRaw) {
          try {
            const parsed = JSON.parse(userDataRaw) as { profilePicture?: string };
            if (parsed?.profilePicture && isMounted) {
              setProfilePicture(`${baseUrl}${parsed.profilePicture}`);
            }
          } catch {
            // ignore invalid cookie payload
          }
        }

        const response = await getProfile();
        const profilePic = response?.data?.profilePicture;
        const resolvedUrl = profilePic ? `${baseUrl}${profilePic}` : null;
        if (isMounted) {
          setProfilePicture(resolvedUrl);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const eventCategories = [
    {
      name: "Birthday",
      icon: FaBirthdayCake,
      iconColor: "text-pink-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Anniversary",
      icon: FaHeart,
      iconColor: "text-red-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Wedding",
      icon: FaRing,
      iconColor: "text-purple-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Engagement",
      icon: FaGem,
      iconColor: "text-blue-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Workshop",
      icon: FaTools,
      iconColor: "text-green-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Conference",
      icon: FaMicrophone,
      iconColor: "text-indigo-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Graduation",
      icon: FaGraduationCap,
      iconColor: "text-yellow-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      name: "Fundraisers",
      icon: FaDonate,
      iconColor: "text-orange-500",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    }
  ];

  return (
    <main className="min-h-screen" style={{ background: '#FFE4E1' }}>
      {/* Header */}
      <NavigationBar profilePicture={profilePicture} />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventCategories.map((category, index) => (
            <Link
              key={category.name}
              href={`/create-event?category=${category.name.toLowerCase()}`}
              className={`${category.color} ${category.hoverColor} rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer`}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`
              }}
            >
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                <category.icon className={category.iconColor} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Create Event Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Create Your Event?</h2>
          <p className="text-gray-600 mb-8">Organize and manage events effortlessly with Evently.</p>
          <Link
            href="/create-event"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </Link>
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
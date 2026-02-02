"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function EventsPage() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-4">
          <Link href="/home" className="text-sm text-rose-900 hover:underline">
            ← Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>
      <section className="px-12 pb-12">
        <p className="text-gray-700">Select a category to explore available events.</p>
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen f bg-pink-50 text-black">
      <header className="flex justify-between items-center px-12 py-8">
 
      </header>

      <section className="flex items-center justify-center py-24">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Evently!</h1>
          <p className="text-grey">Your event management dashboard</p>
        </div>
      </section>
    </main>
  );
}
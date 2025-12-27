"use client";

import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      
      <header className="flex justify-between items-center px-12 py-8">
   
        <Image
          src="/evently logo.png"
          alt="Evently logo"
          width={64}
          height={64}
          className="object-contain"
        />

        <nav className="flex gap-12 text-sm">
          <a href="home">Home</a>
          <a href="features">Features</a>
          <a href="pricing">Pricing</a>
          <a href="about">About Us</a>
        </nav>

        <div className="flex gap-4">
          <button className="px-5 py-2 text-sm">Sign Up</button>
          <button className="px-6 py-2 rounded-full bg-rose-900 text-white text-sm">Log in</button>
        </div>
      </header>
      
      <section className="grid grid-cols-2 gap-16 px-12 py-16">
        
        <div className="space-y-6">
          <h1 className="text-6xl font-bold leading-tight">
            Plan unforgettable events with ease.
          </h1>

          <p className="text-base">
            Evently helps you organize, customize,<br />
            and book events effortlessly.
          </p>

          <div className="space-y-2">
            <button className="px-7 py-3 bg-rose-900 text-white text-sm font-semibold rounded">
              Get Started
            </button>
            <div>
              <button className="text-sm underline">Explore more</button>
            </div>
          </div>
        </div>

     
        <div className="relative h-96">
          <Image
            src="/ballon.png"
            alt="Balloons decoration"
            width={400}
            height={300}
            className="absolute top-0 right-0 object-contain"
          />
          <Image
            src="/party.png"
            alt="Party celebration"
            width={450}
            height={350}
            className="absolute bottom-0 left-0 object-contain"
          />
        </div>
      </section>

    </main>
  );
}
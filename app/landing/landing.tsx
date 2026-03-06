

"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";


export default function LandingPage() {
  // Refs for scroll targets
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  // Smooth scroll handler
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col scroll-smooth bg-[var(--background)] text-[var(--foreground)]"
    >
      {/* Header */}
      <header className="flex justify-between items-center px-8 md:px-12 py-6 md:py-8 sticky top-0 z-20 bg-[var(--background)] bg-opacity-95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <Link href="/">
          <Image
            src="/evently logo.png"
            alt="Evently logo"
            width={56}
            height={56}
            className="object-contain"
          />
        </Link>
        <nav className="flex gap-8 md:gap-12 text-base font-medium">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-rose-900 transition-colors">Home</button>
          <button onClick={() => scrollToSection(featuresRef)} className="hover:text-rose-900 transition-colors">Features</button>
          <button onClick={() => scrollToSection(pricingRef)} className="hover:text-rose-900 transition-colors">Pricing</button>
          <button onClick={() => scrollToSection(aboutRef)} className="hover:text-rose-900 transition-colors">About Us</button>
        </nav>
        <div className="flex gap-2 md:gap-4">
          <Link href="/register" className="px-4 py-2 text-sm rounded hover:underline">Sign Up</Link>
          <Link 
            href="/login" 
            className="px-5 py-2 rounded-full shadow-sm border border-rose-900 text-rose-900 hover:bg-rose-900 hover:text-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 px-6 md:px-12 py-16 items-center flex-1">
        {/* Subtle background shapes */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-rose-100 rounded-full opacity-40 blur-2xl z-0" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-200 rounded-full opacity-30 blur-2xl z-0" />

        {/* Text Content */}
        <div className="space-y-8 z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-2">
            Plan unforgettable <span className="text-rose-900">events</span> with ease.
          </h1>
          <p className="text-lg text-gray-700 max-w-xl">
            Evently helps you organize, customize, and book events effortlessly.<br />
            Make every moment memorable with our all-in-one platform.
          </p>
          <div className="flex gap-4 items-center mt-4">
            <Link 
              href="/register" 
              className="inline-block px-7 py-3 bg-rose-900 text-white text-base font-semibold rounded-full shadow hover:bg-rose-800 transition-colors"
            >
              Get Started
            </Link>
            <button onClick={() => scrollToSection(featuresRef)} className="text-base underline hover:text-rose-900 transition-colors">
              Explore more
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="relative h-80 flex items-center justify-center z-10">
          <div className="absolute top-0 right-0">
            <Image
              src="/ballon.png"
              alt="Balloons decoration"
              width={260}
              height={180}
              className="object-contain drop-shadow"
            />
          </div>
          <div className="absolute bottom-0 left-0">
            <Image
              src="/party.png"
              alt="Party celebration"
              width={280}
              height={200}
              className="object-contain drop-shadow"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-20 px-4 md:px-24 mx-auto w-full max-w-6xl my-10 shadow-md rounded-3xl glassy-section"
        style={{
          background: 'rgba(255,255,255,0.35)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-rose-900 mb-6 text-center">Features</h2>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          Discover the tools Evently provides for planning, organizing, and managing events.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-rose-900">Easy Event Creation</h3>
            <p className="text-gray-700">Create and customize events in minutes with our intuitive interface.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-rose-900">Smart Invitations</h3>
            <p className="text-gray-700">Send invites, track RSVPs, and manage your guest list effortlessly.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-rose-900">Vendor Marketplace</h3>
            <p className="text-gray-700">Browse and book trusted vendors for every aspect of your event.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        className="py-20 px-4 md:px-24 mx-auto w-full max-w-6xl my-10 shadow-md rounded-3xl glassy-section"
        style={{
          background: 'rgba(255,255,255,0.30)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-rose-900 mb-6 text-center">Pricing</h2>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          Transparent pricing plans for every type of event organizer.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow border border-rose-100">
            <h3 className="text-lg font-semibold mb-2 text-rose-900">Starter</h3>
            <p className="text-gray-700 mb-4">For individuals and small events</p>
            <div className="text-2xl font-bold text-rose-900 mb-2">Free</div>
            <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
              <li>Up to 2 events/month</li>
              <li>Basic support</li>
            </ul>
            <button className="mt-2 px-6 py-2 bg-rose-900 text-white rounded-full hover:bg-rose-800 transition-colors">Get Started</button>
          </div>
          <div className="bg-white rounded-xl p-8 shadow border-2 border-rose-900 scale-105">
            <h3 className="text-lg font-semibold mb-2 text-rose-900">Pro</h3>
            <p className="text-gray-700 mb-4">For professionals and frequent planners</p>
            <div className="text-2xl font-bold text-rose-900 mb-2">$19/mo</div>
            <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
              <li>Unlimited events</li>
              <li>Priority support</li>
              <li>Vendor marketplace access</li>
            </ul>
            <button className="mt-2 px-6 py-2 bg-rose-900 text-white rounded-full hover:bg-rose-800 transition-colors">Start Pro</button>
          </div>
          <div className="bg-white rounded-xl p-8 shadow border border-rose-100">
            <h3 className="text-lg font-semibold mb-2 text-rose-900">Enterprise</h3>
            <p className="text-gray-700 mb-4">For organizations and agencies</p>
            <div className="text-2xl font-bold text-rose-900 mb-2">Custom</div>
            <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>Team management</li>
            </ul>
            <button className="mt-2 px-6 py-2 bg-rose-900 text-white rounded-full hover:bg-rose-800 transition-colors">Contact Us</button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section
        ref={aboutRef}
        className="py-20 px-4 md:px-24 mx-auto w-full max-w-6xl my-10 shadow-md rounded-3xl glassy-section"
        style={{
          background: 'rgba(255,255,255,0.35)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-rose-900 mb-6 text-center">About Evently</h2>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          We help people create unforgettable events with simple, powerful planning tools.<br />
          Our mission is to make event planning accessible, fun, and stress-free for everyone.
        </p>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <Image src="/evently logo.png" alt="Evently logo" width={80} height={80} className="rounded-full shadow" />
          <div className="text-gray-700 max-w-xl text-center md:text-left">
            <p className="mb-2">Founded in 2024, Evently has helped thousands of users plan and celebrate their most important moments. Our team is passionate about building tools that empower you to create, connect, and celebrate with ease.</p>
            <p>Ready to plan your next event? <span className="text-rose-900 font-semibold">Join Evently today!</span></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-100">
        &copy; {new Date().getFullYear()} Evently. All rights reserved.
      </footer>
    </main>
  );
}

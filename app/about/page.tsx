import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col animate-fadeIn" style={{background: 'var(--background)', color: 'var(--foreground)'}}>
      <header className="flex justify-between items-center px-12 py-8 sticky top-0 z-20 bg-[var(--background)] bg-opacity-90 backdrop-blur-md shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-rose-900 font-bold text-lg hover:underline">
          <span className="text-2xl">←</span> Home
        </Link>
        <nav className="flex gap-10 text-black-sm">
          <Link href="/features" className="hover:underline">Features</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/about" className="underline underline-offset-4 text-rose-900">About Us</Link>
        </nav>
      </header>
      <section className="py-24 px-6 md:px-24 bg-white/80 backdrop-blur rounded-3xl mx-auto w-full max-w-6xl my-12 shadow-lg animate-card-slide-in">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-900 mb-6 text-center">About Evently</h1>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          We help people create unforgettable events with simple, powerful planning tools.<br />
          Our mission is to make event planning accessible, fun, and stress-free for everyone.
        </p>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <Image src="/evently logo.png" alt="Evently logo" width={100} height={100} className="rounded-full shadow-lg" />
          <div className="text-gray-700 max-w-xl text-center md:text-left">
            <p className="mb-2">Founded in 2024, Evently has helped thousands of users plan and celebrate their most important moments. Our team is passionate about building tools that empower you to create, connect, and celebrate with ease.</p>
            <p>Ready to plan your next event? <span className="text-rose-900 font-semibold">Join Evently today!</span></p>
          </div>
        </div>
      </section>
    </main>
  );
}

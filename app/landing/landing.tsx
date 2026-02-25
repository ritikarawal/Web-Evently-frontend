import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >

      <header className="flex justify-between items-center px-12 py-8">
        <Link href="/">
          <Image
            src="/evently logo.png"
            alt="Evently logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </Link>

        <nav className="flex gap-12 text-black-sm">
          <Link href="/">Home</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About Us</Link>
        </nav>

        <div className="flex gap-4">
          <Link href="/register" className="px-5 py-2 text-sm">
            Sign Up
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full"
            style={{
              background: 'var(--primary)',
              color: 'var(--nav-selected)',
            }}
          >
            Log in
          </Link>
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
            <Link 
              href="/register" 
              className="inline-block px-7 py-3 bg-rose-900 text-white text-sm font-semibold rounded hover:bg-rose-800 transition"
            >
              Get Started
            </Link>
            <div>
              <Link href="/features" className="text-sm underline">
                Explore more
              </Link>
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

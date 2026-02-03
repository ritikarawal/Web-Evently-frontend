import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8">
        <Link href="/" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>
      <section className="px-12 py-8">
        <h1 className="text-4xl font-bold">About Evently</h1>
        <p className="mt-4 text-base text-gray-700">
          We help people create unforgettable events with simple, powerful planning tools.
        </p>
      </section>
    </main>
  );
}

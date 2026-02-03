import Link from "next/link";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8">
        <Link href="/" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>
      <section className="px-12 py-8">
        <h1 className="text-4xl font-bold">Features</h1>
        <p className="mt-4 text-base text-gray-700">
          Discover the tools Evently provides for planning, organizing, and managing events.
        </p>
      </section>
    </main>
  );
}

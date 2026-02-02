import Link from "next/link";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/home" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>
      <section className="px-12 pb-12">
        <p className="text-gray-700">Select a category to explore available events.</p>
      </section>
    </main>
  );
}

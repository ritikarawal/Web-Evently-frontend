import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8">
        <Link href="/" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>
      <section className="px-12 py-8">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-4 text-base text-gray-700">
          Transparent pricing plans for every type of event organizer.
        </p>
      </section>
    </main>
  );
}

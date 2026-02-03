import Link from "next/link";

interface CategoryPageProps {
  params: { category: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryLabel = decodeURIComponent(params.category);

  return (
    <main className="min-h-screen bg-pink-50 text-black">
      <header className="px-12 py-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold capitalize">{categoryLabel} Events</h1>
        <Link href="/home" className="text-sm text-rose-900 hover:underline">
          ← Back to Home
        </Link>
      </header>
      <section className="px-12 pb-12">
        <p className="text-gray-700">Events for {categoryLabel} will appear here.</p>
      </section>
    </main>
  );
}

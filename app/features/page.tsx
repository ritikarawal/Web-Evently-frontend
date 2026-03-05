import Link from "next/link";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen flex flex-col animate-fadeIn" style={{background: 'var(--background)', color: 'var(--foreground)'}}>
      <header className="flex justify-between items-center px-12 py-8 sticky top-0 z-20 bg-[var(--background)] bg-opacity-90 backdrop-blur-md shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-rose-900 font-bold text-lg hover:underline">
          <span className="text-2xl">←</span> Home
        </Link>
        <nav className="flex gap-10 text-black-sm">
          <Link href="/features" className="underline underline-offset-4 text-rose-900">Features</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/about" className="hover:underline">About Us</Link>
        </nav>
      </header>
      <section className="py-24 px-6 md:px-24 bg-white/80 backdrop-blur rounded-3xl mx-auto w-full max-w-6xl my-12 shadow-lg animate-card-slide-in">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-900 mb-6 text-center">Features</h1>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          Discover the tools Evently provides for planning, organizing, and managing events.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition animate-card-slide-in animation-delay-100">
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Easy Event Creation</h3>
            <p className="text-gray-700">Create and customize events in minutes with our intuitive interface.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition animate-card-slide-in animation-delay-200">
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Smart Invitations</h3>
            <p className="text-gray-700">Send invites, track RSVPs, and manage your guest list effortlessly.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition animate-card-slide-in animation-delay-300">
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Vendor Marketplace</h3>
            <p className="text-gray-700">Browse and book trusted vendors for every aspect of your event.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

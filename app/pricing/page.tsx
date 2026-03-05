import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col animate-fadeIn" style={{background: 'var(--background)', color: 'var(--foreground)'}}>
      <header className="flex justify-between items-center px-12 py-8 sticky top-0 z-20 bg-[var(--background)] bg-opacity-90 backdrop-blur-md shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-rose-900 font-bold text-lg hover:underline">
          <span className="text-2xl">←</span> Home
        </Link>
        <nav className="flex gap-10 text-black-sm">
          <Link href="/features" className="hover:underline">Features</Link>
          <Link href="/pricing" className="underline underline-offset-4 text-rose-900">Pricing</Link>
          <Link href="/about" className="hover:underline">About Us</Link>
        </nav>
      </header>
      <section className="py-24 px-6 md:px-24 bg-rose-50 rounded-3xl mx-auto w-full max-w-6xl my-12 shadow-lg animate-card-slide-in">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-900 mb-6 text-center">Pricing</h1>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          Transparent pricing plans for every type of event organizer.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-md border border-rose-100 animate-card-slide-in animation-delay-100">
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Starter</h3>
            <p className="text-gray-700 mb-4">For individuals and small events</p>
            <div className="text-3xl font-bold text-rose-900 mb-2">Free</div>
            <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
              <li>Up to 2 events/month</li>
              <li>Basic support</li>
            </ul>
            <button className="mt-2 px-6 py-2 bg-rose-900 text-white rounded-full hover:bg-rose-800 transition">Get Started</button>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md border-2 border-rose-900 animate-card-slide-in animation-delay-200 scale-105">
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Pro</h3>
            <p className="text-gray-700 mb-4">For professionals and frequent planners</p>
            <div className="text-3xl font-bold text-rose-900 mb-2">$19/mo</div>
            <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
              <li>Unlimited events</li>
              <li>Priority support</li>
              <li>Vendor marketplace access</li>
            </ul>
            <button className="mt-2 px-6 py-2 bg-rose-900 text-white rounded-full hover:bg-rose-800 transition">Start Pro</button>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md border border-rose-100 animate-card-slide-in animation-delay-300">
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Enterprise</h3>
            <p className="text-gray-700 mb-4">For organizations and agencies</p>
            <div className="text-3xl font-bold text-rose-900 mb-2">Custom</div>
            <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>Team management</li>
            </ul>
            <button className="mt-2 px-6 py-2 bg-rose-900 text-white rounded-full hover:bg-rose-800 transition">Contact Us</button>
          </div>
        </div>
      </section>
    </main>
  );
}

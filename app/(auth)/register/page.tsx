import Image from "next/image";
import Link from "next/link";
import RegisterForm from "../_components/register_form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-pink-50">
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

        <nav className="flex gap-12 text-base">
          <Link href="/" className="text-gray-900">Home</Link>
          <Link href="/features" className="text-gray-900">Features</Link>
          <Link href="/pricing" className="text-gray-900">Pricing</Link>
          <Link href="/about" className="text-gray-900">About Us</Link>
        </nav>

        <div className="flex gap-4 items-center">
          <Link href="/register" className="px-8 py-2.5 rounded-full bg-rose-900 text-white text-sm font-medium">
            Sign Up
          </Link>
          <Link href="/login" className="px-6 py-2 text-sm text-gray-900">
            Log in
          </Link>
        </div>
      </header>

      {/* Register Section */}
      <section className="grid grid-cols-2 gap-16 px-12 py-12 items-start">
        {/* Left Side - Illustration */}
        <div className="flex justify-center pt-0">
          <Image
            src="/party.png"
            alt="Party celebration"
            width={550}
            height={450}
            className="object-contain"
          />
        </div>

        <div className="flex justify-center">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
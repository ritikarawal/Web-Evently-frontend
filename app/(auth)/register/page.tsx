import Image from "next/image";
import Link from "next/link";
import RegisterForm from "../_components/register_form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-pink-50 text-black">
      
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

        <nav className="flex gap-12 text-sm text-black">
          <Link href="/">Home</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About Us</Link>
        </nav>

        <div className="flex gap-4 items-center">
          <Link href="/register" className="px-6 py-2 rounded-full bg-rose-900 text-white text-sm">Sign Up</Link>
          <Link href="/login" className="px-5 py-2 text-sm">Log in</Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-16 px-12 py-0 items-center">
        
        <div className="flex justify-center">
          <Image
            src="/onboarding1.jpg"
            alt="Party celebration"
            width={500}
            height={400}
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
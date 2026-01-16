"use client";
// import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/lib/authSchema";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = (data: RegisterFormData) => {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

    (async () => {
      try {
        const res = await fetch(`${backendBase}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (res.ok) {
          alert("Registration successful! Redirecting to login...");
          router.push("/login");
        } else {
          alert(json?.message || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        alert("Registration failed: " + (err as any).message);
      }
    })();
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="First name"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.firstName && (
              <span className="text-red-600 text-sm mt-1 block">{errors.firstName.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Last name"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.lastName && (
              <span className="text-red-600 text-sm mt-1 block">{errors.lastName.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.username && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.username.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number
            </label>
            <input
              {...register("phoneNumber")}
              type="tel"
              placeholder="Enter your number"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.phoneNumber && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.phoneNumber.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your Password"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.password && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.confirmPassword && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-900 text-white font-semibold rounded-lg hover:bg-rose-800 transition mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-rose-900 font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
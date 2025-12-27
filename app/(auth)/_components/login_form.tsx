"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

export type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("Login data:", data);
    alert(`Logging in with: ${data.email}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Welcome to Evently!
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="text"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.email && (
            <span className="text-red-600 text-sm mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter your Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.password && (
            <span className="text-red-600 text-sm mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full py-3 bg-rose-900 text-white font-semibold rounded-lg hover:bg-rose-800 transition mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-600 mt-6">
        Dont have an account?{" "}
        <Link href="/register" className="text-rose-900 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
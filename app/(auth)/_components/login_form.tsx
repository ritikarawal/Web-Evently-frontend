"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginFormData, loginSchema } from "@/app/(auth)/authSchema";
import { useState } from "react";
import { login } from "@/lib/api/auth";
import { setAuthTokenClient, setUserDataClient } from "@/lib/client-cookie";

export default function LoginForm() {
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const [error, setError] = useState<string>("");

  async function onSubmit(data: LoginFormData) {
    setError("");
    try{
      
      const result= await login(data)
       if (result.success) {
                setAuthTokenClient(result.token);
                setUserDataClient(result.data);
                const role = result?.data?.role;
                if (role === "admin") {
                  router.push("/admin/dashboard");
                } else {
                  router.push("/home");
                }
            } else {
                throw new Error(result.message || "Registration failed");
            }
      
    }catch(err: unknown){
      if (err instanceof Error) {
        setError(err.message || "Login failed");
      } else if (typeof err === "string") {
        setError(err || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
        Welcome back
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 border border-red-400 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register("email")}
              type="text"
              placeholder="Enter your email"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your Password"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.password && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-rose-900 text-white font-semibold rounded-lg hover:bg-rose-800 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </div>
      </form>
      <p className="text-right text-sm text-gray-600 mt-2">
        <Link href="/request-password-reset" className="text-rose-900 font-semibold hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-sm text-gray-600 mt-6">
        Dont have an account?{" "}
        <Link href="/register" className="text-rose-900 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
      
    </div>
  );
}
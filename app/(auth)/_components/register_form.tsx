"use client";
// import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/lib/authSchema";
import Link from "next/link";
export default function RegisterForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Register data:", data);
    alert(`Registering with: ${data.username}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            {...register("fullName")}
            type="text"
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.fullName && (
            <span className="text-red-600 text-sm mt-1 block">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            placeholder="Enter your username"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.username && (
            <span className="text-red-600 text-sm mt-1 block">
              {errors.username.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number
          </label>
          <input
            {...register("phoneNumber")}
            type="tel"
            placeholder="Enter your number"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.phoneNumber && (
            <span className="text-red-600 text-sm mt-1 block">
              {errors.phoneNumber.message}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.confirmPassword && (
            <span className="text-red-600 text-sm mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full py-3 bg-rose-900 text-white font-semibold rounded-lg hover:bg-rose-800 transition mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing up..." : "Sign in"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-rose-900 font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
"use client";
// import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/lib/authSchema";

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
    alert(`Registration successful for: ${data.email}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg px-4 py-2 w-full max-w-md">
      <div className="space-y-1">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Full Name
          </label>
          <input
            {...register("fullName")}
            type="text"
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.fullName && (
            <span className="text-red-600 text-xs mt-1 block">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            placeholder="Enter your username"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.username && (
            <span className="text-red-600 text-xs mt-1 block">
              {errors.username.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Number
          </label>
          <input
            {...register("phoneNumber")}
            type="tel"
            placeholder="Enter your number"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.phoneNumber && (
            <span className="text-red-600 text-xs mt-1 block">
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="text"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.email && (
            <span className="text-red-600 text-xs mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter your Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.password && (
            <span className="text-red-600 text-xs mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Confirm password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-900"
          />
          {errors.confirmPassword && (
            <span className="text-red-600 text-xs mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-12 py-3 bg-rose-900 text-white font-medium rounded-lg hover:bg-rose-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing up..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

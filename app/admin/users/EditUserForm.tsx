"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/app/(auth)/authSchema";
import { updateUser } from "@/lib/api/adminUsers";
import { useState, useEffect } from "react";

export default function EditUserForm({ user, onSuccess, onCancel }: { user: any, onSuccess?: () => void, onCancel?: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ...user,
      password: "",
      confirmPassword: "",
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      Object.keys(user).forEach(key => {
        setValue(key as keyof RegisterFormData, user[key]);
      });
    }
  }, [user, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setSuccess("");
    try {
      await updateUser(user._id, data);
      setSuccess("User updated successfully");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update user");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-100 p-2 rounded">{success}</div>}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">First Name</label>
          <input {...register("firstName")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.firstName && <span className="text-red-600 text-xs">{errors.firstName.message}</span>}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Last Name</label>
          <input {...register("lastName")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.lastName && <span className="text-red-600 text-xs">{errors.lastName.message}</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Email</label>
          <input {...register("email")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.email && <span className="text-red-600 text-xs">{errors.email.message}</span>}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Username</label>
          <input {...register("username")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.username && <span className="text-red-600 text-xs">{errors.username.message}</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Phone Number</label>
          <input {...register("phoneNumber")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.phoneNumber && <span className="text-red-600 text-xs">{errors.phoneNumber.message}</span>}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Role</label>
          <select {...register("role")} className="border rounded px-2 py-1 w-full text-black">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Password</label>
          <input type="password" {...register("password")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.password && <span className="text-red-600 text-xs">{errors.password.message}</span>}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-black mb-1">Confirm Password</label>
          <input type="password" {...register("confirmPassword")} className="border rounded px-2 py-1 w-full text-black" />
          {errors.confirmPassword && <span className="text-red-600 text-xs">{errors.confirmPassword.message}</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update User"}
        </button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded w-full" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

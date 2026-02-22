"use client";

import { useAuth } from '@/contexts/AuthContext';

export default function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
      ✓ Logged in as {user?.email}
      {user?.role === 'admin' && <span className="ml-2 px-2 py-0.5 bg-purple-200 text-purple-800 rounded text-xs">ADMIN</span>}
    </div>
  );
}

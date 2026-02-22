"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getProfile, logout as logoutApi } from '@/lib/api/auth';
import { setAuthTokenClient, setUserDataClient, clearAuthCookiesClient } from '@/lib/client-cookie';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// LocalStorage keys
const AUTH_STORAGE_KEYS = {
  TOKEN: 'evently_auth_token',
  USER: 'evently_user_data',
  LOGIN_TIME: 'evently_login_time',
  REMEMBER_ME: 'evently_remember_me'
};

// Session duration: 30 days in milliseconds
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Helper: Get from localStorage
  const getFromStorage = useCallback((key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`[AuthContext] Error reading from localStorage:`, error);
      return null;
    }
  }, []);

  // Helper: Set to localStorage
  const setToStorage = useCallback((key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`[AuthContext] Error writing to localStorage:`, error);
    }
  }, []);

  // Helper: Remove from localStorage
  const removeFromStorage = useCallback((key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[AuthContext] Error removing from localStorage:`, error);
    }
  }, []);

  // Helper: Get cookie value
  const getCookieValue = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(nameEQ)) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }, []);

  // Check if session is still valid
  const isSessionValid = useCallback((): boolean => {
    const loginTime = getFromStorage(AUTH_STORAGE_KEYS.LOGIN_TIME);
    if (!loginTime) return false;
    
    const loginTimestamp = parseInt(loginTime, 10);
    const currentTime = Date.now();
    const sessionAge = currentTime - loginTimestamp;
    
    // Session is valid if less than 30 days old
    return sessionAge < SESSION_DURATION;
  }, [getFromStorage]);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    // Clear localStorage
    removeFromStorage(AUTH_STORAGE_KEYS.TOKEN);
    removeFromStorage(AUTH_STORAGE_KEYS.USER);
    removeFromStorage(AUTH_STORAGE_KEYS.LOGIN_TIME);
    removeFromStorage(AUTH_STORAGE_KEYS.REMEMBER_ME);
    
    // Clear cookies
    clearAuthCookiesClient();
    
    setUser(null);
  }, [removeFromStorage]);

  // Verify token with server
  const verifyToken = useCallback(async (): Promise<User | null> => {
    try {
      console.log('[AuthContext] Verifying token with server...');
      const response = await getProfile();
      
      if (response.success && response.data) {
        console.log('[AuthContext] Token verified successfully:', response.data.email);
        return response.data;
      } else {
        console.log('[AuthContext] Token verification failed');
        return null;
      }
    } catch (error) {
      console.error('[AuthContext] Token verification error:', error);
      return null;
    }
  }, []);

  // Initialize auth session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage first (persistent across browser closes)
        const storedToken = getFromStorage(AUTH_STORAGE_KEYS.TOKEN);
        const storedUser = getFromStorage(AUTH_STORAGE_KEYS.USER);
        
        // If no localStorage data, check cookies (fallback)
        const authToken = storedToken || getCookieValue('auth_token');
        const userDataCookie = storedUser || getCookieValue('user_data');

        if (authToken) {
          console.log('[AuthContext] Found auth token, checking session validity...');
          
          // Check if session is still valid (age < 30 days)
          if (!isSessionValid()) {
            console.log('[AuthContext] Session expired (> 30 days), clearing...');
            clearAuthData();
            setIsLoading(false);
            return;
          }

          // Verify token with server
          const userData = await verifyToken();
          
          if (userData) {
            // Token is valid, restore session
            setUser(userData);
            
            // Sync data to both localStorage and cookies
            setToStorage(AUTH_STORAGE_KEYS.USER, JSON.stringify(userData));
            setToStorage(AUTH_STORAGE_KEYS.TOKEN, authToken);
            setUserDataClient(userData);
            setAuthTokenClient(authToken);
            
            console.log('[AuthContext] Session restored for:', userData.email);
          } else {
            // Token is invalid, clear everything
            console.log('[AuthContext] Invalid token, clearing session');
            clearAuthData();
          }
        } else if (userDataCookie) {
          // Fallback: Try cached user data (edge case)
          try {
            const cachedUser = JSON.parse(decodeURIComponent(userDataCookie));
            console.log('[AuthContext] Using cached user data as fallback:', cachedUser.email);
            
            // Verify with server anyway
            const freshData = await verifyToken();
            if (freshData) {
              setUser(freshData);
              setToStorage(AUTH_STORAGE_KEYS.USER, JSON.stringify(freshData));
            } else {
              // Cached data is stale
              clearAuthData();
            }
          } catch (error) {
            console.error('[AuthContext] Failed to parse cached user data');
            clearAuthData();
          }
        } else {
          console.log('[AuthContext] No existing session found');
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [getFromStorage, getCookieValue, isSessionValid, verifyToken, clearAuthData, setToStorage]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const validateInterval = setInterval(async () => {
      console.log('[AuthContext] Periodic token validation...');
      const isValid = await verifyToken();
      
      if (!isValid) {
        console.log('[AuthContext] Token no longer valid, logging out');
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(validateInterval);
  }, [user, verifyToken]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const validateInterval = setInterval(async () => {
      console.log('[AuthContext] Periodic token validation...');
      const isValid = await verifyToken();
      
      if (!isValid) {
        console.log('[AuthContext] Token no longer valid, logging out');
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(validateInterval);
  }, [user, verifyToken]);

  // Login function - called after successful authentication
  const login = useCallback((token: string, userData: User) => {
    console.log('[AuthContext] Logging in user:', userData.email);
    
    const loginTime = Date.now().toString();
    
    // Store in localStorage for persistence
    setToStorage(AUTH_STORAGE_KEYS.TOKEN, token);
    setToStorage(AUTH_STORAGE_KEYS.USER, JSON.stringify(userData));
    setToStorage(AUTH_STORAGE_KEYS.LOGIN_TIME, loginTime);
    setToStorage(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
    
    // Also store in cookies for backward compatibility
    setAuthTokenClient(token);
    setUserDataClient(userData);
    
    // Update state
    setUser(userData);
    
    console.log('[AuthContext] Session saved to localStorage and cookies');
  }, [setToStorage]);

  // Logout function - clears session and redirects
  const logout = useCallback(() => {
    console.log('[AuthContext] Logging out user');
    
    // Clear all auth data
    clearAuthData();
    
    // Call API logout
    logoutApi();
    
    // Redirect to login
    router.push('/login');
  }, [clearAuthData, router]);

  // Update user data in state, localStorage, and cookies
  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      
      // Update state
      setUser(updatedUser);
      
      // Update localStorage
      setToStorage(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Update cookies
      setUserDataClient(updatedUser);
      
      console.log('[AuthContext] User data updated:', updatedUser.email);
    }
  }, [user, setToStorage]);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      console.log('[AuthContext] Refreshing user data...');
      const response = await getProfile();
      
      if (response.success && response.data) {
        const freshData = response.data;
        
        // Update state
        setUser(freshData);
        
        // Update localStorage
        setToStorage(AUTH_STORAGE_KEYS.USER, JSON.stringify(freshData));
        
        // Update cookies
        setUserDataClient(freshData);
        
        console.log('[AuthContext] User data refreshed successfully');
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user data:', error);
      
      // If refresh fails due to auth error, logout
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('unauthorized') ||
        error.message.includes('Unauthorized')
      )) {
        console.log('[AuthContext] Auth error during refresh, logging out');
        logout();
      }
    }
  }, [setToStorage, logout]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

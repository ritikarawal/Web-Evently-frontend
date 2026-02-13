"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/api/notifications';

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [isAuth, setIsAuth] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(nameEQ)) {
        const value = cookie.substring(nameEQ.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  };

  const isAuthenticated = () => {
    const token = getCookieValue("auth_token");
    const hasToken = !!token && token !== "";
    console.log('[NotificationContext] isAuthenticated check:', hasToken);
    return hasToken;
  };

  const checkAuthStatus = () => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    return authStatus;
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated()) {
      console.log('[NotificationContext] Skipping fetchUnreadCount - user not authenticated');
      return;
    }

    try {
      console.log('[NotificationContext] Starting fetchUnreadCount...');
      const response = await getUnreadNotificationCount();
      const newCount = response.data.unreadCount;
      console.log('[NotificationContext] fetchUnreadCount response:', response.data);

      // If we have new unread notifications compared to last check, show toast (but not too frequently)
      const now = Date.now();
      const timeSinceLastToast = now - lastToastTime;
      const shouldShowToast = newCount > lastNotificationCount && lastNotificationCount >= 0 && timeSinceLastToast > 300000; // 5 minutes

      if (shouldShowToast) {
        await showNewNotificationToast();
        setLastToastTime(now);
      }

      setUnreadCount(newCount);
      setLastNotificationCount(newCount);
    } catch (error: any) {
      console.error('[NotificationContext] Failed to get unread count:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      // Reset count on error to avoid showing stale data
      setUnreadCount(0);
    }
  };

  const showNewNotificationToast = async () => {
    if (!isAuthenticated() || !notificationsEnabled) {
      return; // Don't show if not authenticated or notifications disabled
    }
    try {
      const response = await getUserNotifications(5);
      const notifications = response.data;

      // Show a single, subtle toast indicating new notifications
      const unreadNotifications = notifications.filter((n: any) => !n.isRead);

      if (unreadNotifications.length > 0) {
        // Show a single, less intrusive notification
        toast.info(`🔔 You have ${unreadNotifications.length} new notification${unreadNotifications.length > 1 ? 's' : ''}`, {
          position: "top-right",
          autoClose: 4000, // Shorter duration
          hideProgressBar: true, // Less visual clutter
          closeOnClick: true,
          pauseOnHover: false, // Don't pause on hover to be less intrusive
          draggable: false, // Less interactive
          className: "notification-toast", // Custom class for styling
        });
      }
    } catch (error) {
      console.error('Failed to fetch latest notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_approved':
        return '✅';
      case 'event_declined':
        return '❌';
      case 'event_updated':
        return '📝';
      default:
        return '🔔';
    }
  };

  const refreshNotifications = () => {
    fetchUnreadCount();
  };

  useEffect(() => {
    const authStatus = checkAuthStatus();
    if (!authStatus) {
      console.log('[NotificationContext] Not authenticated, skipping notification polling');
      return;
    }

    console.log('[NotificationContext] Starting notification polling for authenticated user');

    // Initial fetch
    fetchUnreadCount();

    // Poll for new notifications every 2 minutes (less intrusive for admin users)
    const interval = setInterval(fetchUnreadCount, 120000);

    return () => clearInterval(interval);
  }, [isAuth]);

  // Check authentication status periodically
  useEffect(() => {
    checkAuthStatus();
    const authCheckInterval = setInterval(checkAuthStatus, 5000); // Check every 5 seconds
    return () => clearInterval(authCheckInterval);
  }, []);

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
  };

  const value = {
    unreadCount,
    refreshNotifications,
    notificationsEnabled,
    toggleNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
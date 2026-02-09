"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/api/notifications';

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => void;
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
    return !!getCookieValue("auth_token");
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated()) {
      return; // Don't fetch if not authenticated
    }
    try {
      const response = await getUnreadNotificationCount();
      const newCount = response.data.unreadCount;
      
      // If we have new unread notifications compared to last check, show toast
      if (newCount > lastNotificationCount && lastNotificationCount >= 0) {
        await showNewNotificationToast();
      }
      
      setUnreadCount(newCount);
      setLastNotificationCount(newCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const showNewNotificationToast = async () => {
    if (!isAuthenticated()) {
      return; // Don't fetch if not authenticated
    }
    try {
      const response = await getUserNotifications(5);
      const notifications = response.data;

      // Show toast for unread notifications that we haven't shown yet
      const unreadNotifications = notifications.filter((n: any) => !n.isRead);
      
      unreadNotifications.slice(0, 3).forEach((notification: any) => {
        const icon = getNotificationIcon(notification.type);
        toast.info(`${icon} ${notification.title}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      if (unreadNotifications.length > 3) {
        toast.info(`🔔 You have ${unreadNotifications.length - 3} more notifications`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
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
    if (!isAuthenticated()) {
      return; // Don't start polling if not authenticated
    }

    // Initial fetch
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    unreadCount,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
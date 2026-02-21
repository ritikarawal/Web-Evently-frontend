"use client";

import { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, Notification } from '@/lib/api/notifications';
import { Bell, Check, X, Trash2, CheckCheck } from 'lucide-react';
import Sidebar from "@/components/Sidebar";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (const rawCookie of cookies) {
      const cookie = rawCookie.trim();
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

  useEffect(() => {
    fetchNotifications();
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    const userDataRaw = getCookieValue("user_data");
    if (userDataRaw) {
      try {
        const parsed = JSON.parse(userDataRaw) as { profilePicture?: string };
        if (parsed?.profilePicture) {
          setProfilePicture(`${baseUrl}${parsed.profilePicture}`);
        }
      } catch {
        // ignore invalid cookie payload
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getUserNotifications(50);
      setNotifications(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">⚠️ Error loading notifications</div>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Bell className="w-8 h-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">You'll receive notifications about your events here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow-sm border p-6 transition-all ${
                !notification.isRead
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
import axios from "./axios";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'event_approved' | 'event_declined' | 'event_updated' | 'general';
  isRead: boolean;
  eventId?: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getUserNotifications = async (limit?: number) => {
  try {
    const response = await axios.get("/api/notifications", {
      params: { limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch notifications");
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await axios.get("/api/notifications/unread-count");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get unread count");
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await axios.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to mark notification as read");
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put("/api/notifications/mark-all-read");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to mark all notifications as read");
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete notification");
  }
};
import axios from "@/lib/api/axios";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/api/notifications";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("frontend api/notifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getUserNotifications success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);
    await expect(getUserNotifications(10)).resolves.toEqual({ data: [] });
  });

  it("getUserNotifications failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Failed to fetch notifications" } } });
    await expect(getUserNotifications()).rejects.toThrow("Failed to fetch notifications");
  });

  it("getUnreadNotificationCount success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: { unreadCount: 2 } } } as any);
    await expect(getUnreadNotificationCount()).resolves.toEqual({ data: { unreadCount: 2 } });
  });

  it("getUnreadNotificationCount failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Failed to get unread count" } } });
    await expect(getUnreadNotificationCount()).rejects.toThrow("Failed to get unread count");
  });

  it("markNotificationAsRead success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(markNotificationAsRead("n1")).resolves.toEqual({ success: true });
  });

  it("markNotificationAsRead failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Failed to mark notification as read" } } });
    await expect(markNotificationAsRead("n1")).rejects.toThrow("Failed to mark notification as read");
  });

  it("markAllNotificationsAsRead success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(markAllNotificationsAsRead()).resolves.toEqual({ success: true });
  });

  it("markAllNotificationsAsRead failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Failed to mark all notifications as read" } } });
    await expect(markAllNotificationsAsRead()).rejects.toThrow("Failed to mark all notifications as read");
  });

  it("deleteNotification success", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } } as any);
    await expect(deleteNotification("n1")).resolves.toEqual({ success: true });
  });

  it("deleteNotification failure", async () => {
    mockedAxios.delete.mockRejectedValue({ response: { data: { message: "Failed to delete notification" } } });
    await expect(deleteNotification("n1")).rejects.toThrow("Failed to delete notification");
  });
});

import { io, Socket } from "socket.io-client";
import {
  getAdminChatUsers,
  getAdminUserChat,
  sendAdminChatMessage,
} from "@/lib/api/chat";

export interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  messageCount?: number;
  unreadCount?: number;
}

export interface ChatMsg {
  _id?: string;
  from: "user" | "admin";
  text: string;
  timestamp: Date;
  username?: string;
  senderName?: string;
}

export class AdminChatService {
  private socket: Socket | null = null;
  private adminId: string | null = null;
  private listeners: ((type: string, data: any) => void)[] = [];

  private mapChatsToUsers(chats: any[]): ChatUser[] {
    return (chats || []).map((chat: any) => {
      const user = chat?.userId || {};
      const lastMessage = chat?.messages?.[chat.messages.length - 1];
      const unreadCount = (chat?.messages || []).filter(
        (msg: any) => msg?.from === "user" && !msg?.isRead
      ).length;

      return {
        _id: user?._id || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        username: user?.username || "",
        email: user?.email || "",
        profilePicture: user?.profilePicture,
        lastMessage: lastMessage?.text,
        lastMessageTime: lastMessage?.timestamp,
        messageCount: chat?.messages?.length || 0,
        unreadCount,
      } as ChatUser;
    }).filter((user: ChatUser) => Boolean(user._id));
  }

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:5050";
    
    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true
    });

    this.socket.on("connect", () => {
      console.log("✅ Admin connected to chat server");
      if (this.adminId) {
        this.socket?.emit("join_admin_room", this.adminId);
      }
    });

    this.socket.on("receive_user_message", (data: any) => {
      this.notifyListeners("user_message", data);
    });

    this.socket.on("user_online", (data: any) => {
      this.notifyListeners("user_online", data);
    });

    this.socket.on("user_offline", (data: any) => {
      this.notifyListeners("user_offline", data);
    });

    this.socket.on("all_chats", (data: any) => {
      const normalizedUsers = this.mapChatsToUsers(data || []);
      this.notifyListeners("all_chats", normalizedUsers);
    });

    this.socket.on("user_chat", (data: any) => {
      this.notifyListeners("user_chat", data);
    });

    this.socket.on("message_sent", () => {
      this.notifyListeners("message_sent", null);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.notifyListeners("error", error);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Admin disconnected from chat server");
    });
  }

  setAdminId(adminId: string) {
    this.adminId = adminId;
    if (this.socket?.connected) {
      this.socket.emit("join_admin_room", adminId);
    }
  }

  async getAllChats() {
    const users = await getAdminChatUsers();
    this.notifyListeners("all_chats", users);

    if (this.socket?.connected) {
      this.socket.emit("get_all_chats");
    }
  }

  async getUserChat(userId: string) {
    const chat = await getAdminUserChat(userId);
    this.notifyListeners("user_chat", chat);
    await this.getAllChats();

    if (this.socket?.connected) {
      this.socket.emit("get_user_chat", userId);
    }
  }

  async sendMessage(userId: string, message: string, adminName?: string) {
    if (this.socket?.connected && this.adminId) {
      this.socket.emit("send_admin_message", {
        userId,
        adminId: this.adminId,
        message,
        adminName: adminName || "Admin"
      });
      this.notifyListeners("message_persisted", {
        userId,
        message: {
          from: "admin",
          text: message,
          timestamp: new Date(),
          senderName: adminName || "Admin"
        },
      });
      return;
    }

    const persistedMessage = await sendAdminChatMessage(userId, {
      text: message,
      adminName: adminName || "Admin",
    });

    this.notifyListeners("message_persisted", {
      userId,
      message: persistedMessage,
    });
  }

  subscribe(callback: (type: string, data: any) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(type: string, data: any) {
    this.listeners.forEach((cb) => cb(type, data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

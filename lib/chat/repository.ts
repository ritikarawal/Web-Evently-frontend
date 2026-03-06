import { io, Socket } from "socket.io-client";
import { ChatMessage, IChatRepository } from "./domain";
import { getMyChatHistory, sendUserChatMessage } from "@/lib/api/chat";

// This implementation uses WebSocket with Socket.io for real-time communication
export class ChatRepository implements IChatRepository {
  private socket: Socket | null = null;
  private messages: ChatMessage[] = [];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];
  private userId: string | null = null;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // Connect to the backend server
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

    // Socket event handlers
    this.socket.on("connect", () => {
      console.log("✅ Connected to chat server");
      if (this.userId) {
        this.socket?.emit("join_chat", this.userId);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
    });

    this.socket.on("receive_admin_message", (data: any) => {
      const message: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        from: "admin",
        text: data.message,
        timestamp: Date.now(),
        username: data.adminName || "Admin"
      };
      this.messages.push(message);
      this.notifyListeners();
    });

    this.socket.on("message_sent", () => {
      this.notifyListeners();
    });

    this.socket.on("chat_history", (history: any[]) => {
      this.messages = history.map(msg => ({
        id: msg._id || Math.random().toString(36).substr(2, 9),
        from: msg.from,
        text: msg.text,
        timestamp: new Date(msg.timestamp).getTime(),
        username: msg.username || msg.senderName
      }));
      this.notifyListeners();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from chat server");
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    if (this.socket?.connected) {
      this.socket.emit("join_chat", userId);
    }
    void this.getMessages();
  }

  async sendMessage(message: Omit<ChatMessage, "id" | "timestamp">): Promise<void> {
    const text = message.text.trim();
    if (!text) return;

    const localMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      from: message.from,
      text,
      timestamp: Date.now(),
      username: message.username
    };

    this.messages.push(localMessage);
    this.notifyListeners();

    if (this.socket?.connected && this.userId) {
      this.emitMessage({ ...message, text });
    } else {
      if (message.from === "user") {
        try {
          await sendUserChatMessage({
            text,
            username: message.username,
            senderName: message.username
          });
        } catch (error) {
          console.error("Failed to persist user message:", error);
        }
      }
      this.socket?.connect();
    }
  }

  private emitMessage(message: Omit<ChatMessage, "id" | "timestamp">) {
    if (!this.socket?.connected) return;

    if (message.from === "user") {
      if (!this.userId) {
        console.error("Cannot send user message before userId is set");
        return;
      }
      this.socket.emit("send_user_message", {
        userId: this.userId,
        message: message.text,
        username: message.username,
        senderName: message.username
      });
    } else if (message.from === "admin") {
      this.socket.emit("send_admin_message", {
        userId: this.userId,
        message: message.text,
        adminName: message.username
      });
    }
  }

  async getMessages(): Promise<ChatMessage[]> {
    try {
      const history = await getMyChatHistory();
      this.messages = history.map((msg: any) => ({
        id: msg._id || Math.random().toString(36).substr(2, 9),
        from: msg.from,
        text: msg.text,
        timestamp: new Date(msg.timestamp).getTime(),
        username: msg.username || msg.senderName
      }));
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }

    return [...this.messages];
  }

  subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.messages]);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb([...this.messages]));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}


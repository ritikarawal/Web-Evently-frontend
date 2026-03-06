import { ChatMessage, IChatRepository } from "./domain";

// This is a mock implementation. Replace with real API/WebSocket later.
export class ChatRepository implements IChatRepository {
  private messages: ChatMessage[] = [
    { id: "1", from: "admin", text: "Hi! How can I help you?", timestamp: Date.now() },
  ];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];

  async sendMessage(message: Omit<ChatMessage, "id" | "timestamp">): Promise<void> {
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      from: message.from,
      text: message.text,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    this.listeners.forEach((cb) => cb([...this.messages]));
  }

  async getMessages(): Promise<ChatMessage[]> {
    return [...this.messages];
  }

  subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.messages]);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

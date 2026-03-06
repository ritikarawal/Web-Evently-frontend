// Clean architecture: ChatBox domain model, use case, and repository interface

// Message entity
export interface ChatMessage {
  id: string;
  from: 'user' | 'admin';
  text: string;
  timestamp: number;
  username?: string;
}

// Repository interface
export interface IChatRepository {
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void>;
  getMessages(): Promise<ChatMessage[]>;
  subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void;
}

// Use case
export class ChatUseCase {
  constructor(private repo: IChatRepository) {}

  async sendMessage(from: 'user' | 'admin', text: string, username?: string) {
    await this.repo.sendMessage({ from, text, username });
  }

  async getMessages() {
    return this.repo.getMessages();
  }

  subscribeToMessages(callback: (messages: ChatMessage[]) => void) {
    return this.repo.subscribeToMessages(callback);
  }
}

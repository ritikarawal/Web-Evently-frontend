"use client";
import { useEffect, useState, FormEvent } from "react";
import { ChatUseCase, ChatMessage } from "@/lib/chat/domain";
import { ChatRepository } from "@/lib/chat/repository";
import { getProfile } from "@/lib/api/auth";

const chatRepository = new ChatRepository();
const chatUseCase = new ChatUseCase(chatRepository);

export default function UserChatsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const setupUser = async () => {
      try {
        const response = await getProfile();
        const data = response?.data || response;
        setProfile(data);
        if (data?._id) {
          chatRepository.setUserId(data._id);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    setupUser();
    const unsubscribe = chatUseCase.subscribeToMessages(setMessages);
    return () => {
      unsubscribe();
      chatRepository.disconnect();
    };
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await chatUseCase.sendMessage("user", input, profile?.username);
    setInput("");
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#800000] mb-4">Chat with Admin</h1>
      <div className="bg-white/80 rounded-xl shadow p-4 mb-4 h-96 overflow-y-auto flex flex-col-reverse">
        <div>
          {messages.slice().reverse().map((msg) => (
            <div key={msg.id} className={`mb-2 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.from === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-200 text-gray-800"}`}>
                <span className="block text-xs font-semibold mb-1">{msg.from === "user" ? "You" : "Admin"}</span>
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800000] focus:outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="bg-[#800000] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#a00000]">Send</button>
      </form>
    </div>
  );
}

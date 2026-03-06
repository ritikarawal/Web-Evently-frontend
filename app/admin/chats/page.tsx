"use client";
import { useEffect, useState, FormEvent, useRef } from "react";
import { AdminChatService, ChatUser, ChatMsg } from "@/lib/chat/admin-chat.service";
import { getProfile } from "@/lib/api/auth";
import { FiSearch, FiSend } from "react-icons/fi";
import { MdMore } from "react-icons/md";

const adminChatService = new AdminChatService();

export default function AdminChatsPage() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  const selectedUserIdRef = useRef<string | null>(null);
  const usersRef = useRef<ChatUser[]>([]);

  const resolveProfilePicture = (profilePicture?: string) => {
    if (!profilePicture) return "";
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      return profilePicture;
    }
    if (profilePicture.startsWith("/")) {
      return `${baseUrl}${profilePicture}`;
    }
    return `${baseUrl}/${profilePicture}`;
  };

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?._id || null;
  }, [selectedUser]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Initialize admin and setup socket
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        const response = await getProfile();
        const data = response?.data || response;
        setAdminId(data?._id || "");
        setAdminName(data?.firstName || "Admin");
        if (data?._id) {
          adminChatService.setAdminId(data._id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
        setLoading(false);
      }
    };

    setupAdmin();

    const unsubscribe = adminChatService.subscribe((type, data) => {
      if (type === "all_chats") {
        const nextUsers = data || [];
        setUsers(nextUsers);
        if (!selectedUserIdRef.current && nextUsers.length > 0) {
          setSelectedUser(nextUsers[0]);
        }
      } else if (type === "user_chat") {
        if (data) {
          setMessages(data.messages || []);
        } else {
          setMessages([]);
        }
      } else if (type === "user_message") {
        // Update user list and messages when new message arrives
        const incomingUserId = data.userId;

        if (selectedUserIdRef.current && incomingUserId === selectedUserIdRef.current) {
          const newMsg: ChatMsg = {
            from: "user",
            text: data.message,
            timestamp: new Date(data.timestamp),
            username: data.username,
            senderName: data.senderName
          };
          setMessages(prev => [...prev, newMsg]);
          void adminChatService.getUserChat(incomingUserId);
        } else if (incomingUserId) {
          const incomingUser = usersRef.current.find((user) => user._id === incomingUserId);
          if (incomingUser) {
            setSelectedUser(incomingUser);
          }
          void adminChatService.getUserChat(incomingUserId);
        }

        // Refresh user list
        void adminChatService.getAllChats();
      } else if (type === "message_persisted") {
        if (data?.userId === selectedUserIdRef.current && data?.message) {
          setMessages((prev) => [...prev, data.message]);
        }
        void adminChatService.getAllChats();
      }
    });

    // Get all chats on load
    void adminChatService.getAllChats();

    return () => {
      unsubscribe();
      adminChatService.disconnect();
    };
  }, []);

  // Get chat when user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      void adminChatService.getUserChat(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const messageText = input;
    setInput("");
    try {
      await adminChatService.sendMessage(selectedUser._id, messageText, adminName);
    } catch (error) {
      console.error("Failed to send admin message:", error);
      setInput(messageText);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - User List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#800000] mb-4">Messages</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#800000]/20 text-sm"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>{searchTerm ? "No conversations found" : "No conversations yet"}</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedUser?._id === user._id
                    ? "bg-gray-100 border-l-4 border-l-[#800000]"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={resolveProfilePicture(user.profilePicture)}
                        alt={user.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#800000] to-[#b22222] flex items-center justify-center text-white font-bold text-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                    {/* Online indicator could go here */}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {user.lastMessage || "No messages yet"}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {user.unreadCount ? (
                    <span className="flex-shrink-0 w-6 h-6 bg-[#800000] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {user.unreadCount > 99 ? "99+" : user.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {selectedUser.profilePicture ? (
                  <img
                    src={resolveProfilePicture(selectedUser.profilePicture)}
                    alt={selectedUser.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#800000] to-[#b22222] flex items-center justify-center text-white font-bold">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MdMore size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-gray-500 text-lg">No messages yet</p>
                    <p className="text-gray-400 text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.from === "admin"
                          ? "bg-[#800000] text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.from === "admin" ? "text-gray-200" : "text-gray-600"
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-[#800000] text-white rounded-full hover:bg-[#a00000] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12c0 4.97 4.813 9 10.75 9 .98 0 1.94-.09 2.86-.26.41-.07.82.04 1.13.3l2.12 1.77c.66.55 1.65-.02 1.54-.87l-.32-2.36c-.05-.37.09-.74.36-.99C21.13 17.7 21.75 14.97 21.75 12c0-4.97-4.813-9-10.75-9S2.25 7.03 2.25 12z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500">
                Choose a user from the list to view and respond to their messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


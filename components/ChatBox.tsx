import React, { useState, useEffect, useRef } from "react";
import { ChatUseCase } from "@/lib/chat/domain";
import { ChatRepository } from "@/lib/chat/repository";

const chatUseCase = new ChatUseCase(new ChatRepository());

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = chatUseCase.subscribeToMessages(setMessages);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;
    await chatUseCase.sendMessage("user", input);
    setInput("");
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {isOpen ? (
        <div
          className="w-80 rounded-2xl flex flex-col h-112"
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            boxShadow: '0 8px 32px 0 rgba(128,0,0,0.18), 0 1.5px 8px 0 rgba(128,0,0,0.10)',
            overflow: 'hidden'
          }}
        >
          {/* Header with avatar and close */}
          <div className="px-4 py-3 rounded-t-2xl flex items-center justify-between"
            style={{
              background: 'linear-gradient(90deg, #800000 0%, #b22222 100%)',
              color: 'white',
              boxShadow: '0 4px 24px 0 rgba(128,0,0,0.10)'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-white text-[#800000] rounded-full font-bold text-lg">O</span>
              <span className="font-semibold text-base">Organizer Support</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-xl font-bold hover:text-red-200">×</button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)'}}>
            {messages.map((msg: any, idx: number) => {
              const isUser = msg.from === "user";
              return (
                <div key={msg.id || idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md text-sm relative ${isUser ? "bg-gradient-to-br from-[#800000]/90 to-[#b22222]/80 text-white rounded-br-none" : "bg-white/60 text-gray-900 rounded-bl-none border border-white/30"}`}
                    style={isUser ? {boxShadow: '0 2px 8px 0 rgba(128,0,0,0.10)'} : {backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.55)', boxShadow: '0 1px 4px 0 rgba(128,0,0,0.06)'}}
                  >
                    {msg.text}
                    <span className="block text-[10px] text-right text-gray-400 mt-1">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="p-3 border-t flex gap-2 items-center rounded-b-2xl" style={{background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)'}}>
            <input
              className="flex-1 border border-white/30 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b22222]/30 text-sm bg-white/40 placeholder:text-gray-500"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              style={{backdropFilter: 'blur(6px)', color: '#800000'}}
            />
            <button
              className="text-white px-5 py-2 rounded-full font-medium transition-colors"
              style={{
                background: 'linear-gradient(90deg, #800000 0%, #b22222 100%)',
                boxShadow: '0 2px 8px 0 rgba(128,0,0,0.10)'
              }}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform border-4 border-white"
          style={{
            background: 'linear-gradient(90deg, #800000 0%, #b22222 100%)'
          }}
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 4.97 4.813 9 10.75 9 .98 0 1.94-.09 2.86-.26.41-.07.82.04 1.13.3l2.12 1.77c.66.55 1.65-.02 1.54-.87l-.32-2.36c-.05-.37.09-.74.36-.99C21.13 17.7 21.75 14.97 21.75 12c0-4.97-4.813-9-10.75-9S2.25 7.03 2.25 12z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatBox;

"use client";
import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from '@/lib/api';
import Image from "next/image";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  role: MessageRole;
  content: string;
  tokens?: string[];
}

const TOPICS = [
  { icon: "📐", label: "Mathematics",  example: "Why does 0.999... equal 1?" },
  { icon: "🔬", label: "Science",      example: "Why do heavier objects fall at the same speed?" },
  { icon: "📜", label: "History",      example: "Why did the Roman Empire fall?" },
  { icon: "📖", label: "English",      example: "Why does the author use metaphors?" },
  { icon: "💭", label: "Philosophy",   example: "If a tree falls and no one hears it..." },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const data = await sendChatMessage(newMessages, TOPICS[activeTopic].label) as { reply?: string; tokens?: string[] } | null;
    if (data?.reply) {
      setMessages([...newMessages, {
        role: "assistant",
        content: data.reply,
        tokens: data.tokens ?? [],
      }]);
    } else {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Socrates is taking a short break 😌. Please try again in a minute! 👋",
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-50 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="font-semibold text-sm mt-1">Little Socrates</div>
          <div className="text-xs text-gray-500">Ask me anything</div>
        </div>
        {/* Topics */}
        <nav className="flex-1 p-2 space-y-0.5">
          {TOPICS.map((t, i) => (
            <button
              key={i}
              onClick={() => { setActiveTopic(i); setMessages([]); }}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors ${
                activeTopic === i ? "bg-gray-100 font-medium" : "text-gray-600"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/little_socrates.png" alt="Socrates" width={85} height={50} style={{width: 87, height: "auto"}} />
            <div>
              <div className="text-sm font-semibold">Socrates</div>
              <div className="text-xs text-green-500">Online</div>
            </div>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {TOPICS[activeTopic].icon} {TOPICS[activeTopic].label}
          </span>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center pt-16 text-gray-400">
              <Image src="/little_socrates.png" alt="Socrates" className="mx-auto" width={200} height={50} style={{width: 200, height: "auto"}} />
              <p className="text-sm italic">"The only true wisdom is in knowing you know nothing."</p>
              <p className="text-sm mt-2">Try: <span className="text-gray-500">{TOPICS[activeTopic].example}</span></p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col gap-1.5 max-w-[70%]">
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gray-800 text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>

                {/* Tokens shown below assistant reply */}
                {msg.role === "assistant" && msg.tokens && msg.tokens.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-1">
                    {msg.tokens.map((token, j) => (
                      <span key={j} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        {token}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-400">
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 text-sm px-4 py-2.5 border border-gray-300 rounded-full outline-none focus:border-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-gray-800 text-white text-sm rounded-full disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
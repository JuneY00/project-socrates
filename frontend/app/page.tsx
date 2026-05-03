"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from '@/lib/api';

interface ChatMessage {
  role: string; // "user" or "assistant"
  content: string;
}

const TOPICS = [
  { icon: "📐", label: "Mathematics",  example: "Why does 0.999... equal 1?" },
  { icon: "🔬", label: "Science",      example: "Why do heavier objects fall at the same speed as lighter ones?" },
  { icon: "📜", label: "History",      example: "Why did the Roman Empire fall?" },
  { icon: "📖", label: "English",      example: "Why does the author use metaphors instead of just saying things directly?" },
  { icon: "💭", label: "Philosophy",   example: "If a tree falls in a forest and no one hears it, does it make a sound?" },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const data = await sendChatMessage(newMessages, TOPICS[activeTopic].label) as { reply?: string; tokens?: string[] } | null;
    if (data && data.reply) {
      setMessages([...newMessages, { role: "model", content: data.reply }]);
      setTokens(data.tokens ?? []);
    } else {
      // api error handling - show a message from the model
      setMessages([...newMessages, {
        role: "model",
        content: "sleepy... zzz... (Sorry, something went wrong. Please try again.)"
      }]);
      setTokens([]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f5f0e8" }}>

      {/* sidebar */}
      <aside style={{
        width: 210,
        flexShrink: 0,
        background: "#1c3d36",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* logo area */}
        <div style={{ padding: "24px 16px 16px", borderBottom: "1px solid #2a5248", textAlign: "center" }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{ fontSize: 38, marginBottom: 10 }}
          >
            👴
          </motion.div>
          <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 14 }}>Little Socrates</div>
          <div style={{ color: "#6dbfaf", fontSize: 10, marginTop: 4, fontStyle: "italic" }}>
            Journey to find your wisdom
          </div>
        </div>

        {/* topic list */}
        <div style={{ padding: "14px 14px 6px", color: "#6dbfaf", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Topics
        </div>
        <nav style={{ display: "flex", flexDirection: "column", padding: "0 8px", gap: 2 }}>
          {TOPICS.map((t, i) => (
            <button
              key={i}
              onClick={() => { setActiveTopic(i); setMessages([]); setTokens([]); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: "left",
                border: "none",
                background: activeTopic === i ? "#2a5248" : "transparent",
                color: activeTopic === i ? "#ffffff" : "#8ecfc3",
              }}
            >
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* concept tokens */}
        <div style={{ marginTop: "auto", padding: "14px 14px", borderTop: "1px solid #2a5248" }}>
          <div style={{ color: "#6dbfaf", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Concepts
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 24 }}>
            <AnimatePresence>
              {tokens.map((token, i) => (
                <motion.span
                  key={token + i}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  style={{
                    background: "#fef08a",
                    color: "#7a4f00",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 9px",
                    borderRadius: 20,
                    cursor: "default",
                  }}
                >
                  #{token}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ padding: "10px 14px 18px" }}>
          <button
            onClick={() => { setMessages([]); setTokens([]); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a5248")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            style={{
              width: "100%",
              background: "transparent",
              border: "1.5px solid #4a8a7a",
              color: "#6dbfaf",
              fontSize: 11,
              fontWeight: 700,
              padding: "8px",
              borderRadius: 6,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            + New Dialogue
          </button>
        </div>
      </aside>

      {/* main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: 20 }}>

        {/* chat container */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: 12,
          border: "1.5px solid #d4cfc6",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>

          {/* header */}
          <div style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1.5px solid #ede8df",
            background: "#faf7f2",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                background: "#ede8df",
                borderRadius: "50%",
                border: "1.5px solid #c4b9a8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>
                👴
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1c3d36" }}>Socrates</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6dbfaf" }}>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: 6, height: 6, background: "#4dbfa0", borderRadius: "50%", display: "inline-block" }}
                  />
                  Online
                </div>
              </div>
            </div>
            <span style={{
              background: "#fef9e7",
              color: "#7a4f00",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid #f0d080",
            }}>
              {TOPICS[activeTopic].icon} {TOPICS[activeTopic].label}
            </span>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12, background: "#fdfcfa" }}>

            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: 50, marginBottom: 16 }}
                >
                  👴💡
                </motion.div>
                <p style={{ color: "#b0a898", fontStyle: "italic", fontSize: 13 }}>
                  "The only true wisdom is in knowing you know nothing."
                </p>
                <p style={{ color: "#4dbfa0", marginTop: 10, fontWeight: 600, fontSize: 13 }}>
                  Start a dialogue with me!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div style={{
                  maxWidth: "75%",
                  padding: "10px 15px",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.65,
                  ...(msg.role === "user"
                    ? { background: "#1c3d36", color: "#f5f0e8", borderRadius: 16, borderTopRightRadius: 3 }
                    : { background: "#fef9e7", color: "#2a2a2a", border: "1px solid #f0d080", borderRadius: 16, borderTopLeftRadius: 3 }
                  ),
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", alignItems: "center", gap: 8, color: "#6dbfaf", fontWeight: 600, fontSize: 13 }}
              >
                <span style={{ position: "relative", display: "flex", width: 12, height: 12 }}>
                  <motion.span
                    animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#4dbfa0" }}
                  />
                  <span style={{ position: "relative", width: 12, height: 12, borderRadius: "50%", background: "#4dbfa0", display: "block" }} />
                </span>
                Socrates is contemplating...
              </motion.div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* input area */}
          <div style={{ flexShrink: 0, padding: "12px 16px", borderTop: "1.5px solid #ede8df", background: "#faf7f2" }}>
            <div style={{
              display: "flex",
              gap: 8,
              background: "#ffffff",
              borderRadius: 24,
              border: "1.5px solid #c4d4d0",
              padding: "5px 5px 5px 16px",
              alignItems: "center",
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={TOPICS[activeTopic].example}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  color: "#2a2a2a",
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                style={{
                  width: 36, height: 36,
                  borderRadius: "50%",
                  background: isLoading ? "#c4c4c4" : "#1c3d36",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg fill="none" stroke="white" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
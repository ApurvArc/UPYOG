import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

// ── Inline markdown renderer ───────────────────────────────────────────────
const renderMarkdown = (text) => {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    // Bullet line
    const isBullet = line.trimStart().startsWith("- ");
    const content  = isBullet ? line.trimStart().slice(2) : line;

    // Parse inline bold/italic
    const parseInline = (str) => {
      const parts = [];
      // bold **text** then italic *text*
      const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
      let last = 0, m;
      while ((m = regex.exec(str)) !== null) {
        if (m.index > last) parts.push(str.slice(last, m.index));
        if (m[1] !== undefined) parts.push(<strong key={m.index} className="font-bold">{m[1]}</strong>);
        else parts.push(<em key={m.index} className="italic">{m[2]}</em>);
        last = m.index + m[0].length;
      }
      if (last < str.length) parts.push(str.slice(last));
      return parts;
    };

    const parsed = parseInline(content);
    if (isBullet) return <div key={li} className="flex gap-2 my-0.5"><span className="text-primary mt-0.5 flex-shrink-0">•</span><span>{parsed}</span></div>;
    if (!content.trim()) return <div key={li} className="h-1" />;
    return <div key={li}>{parsed}</div>;
  });
};

const VITE_MISTRAL_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const VITE_GROQ_KEY    = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are an AI assistant for the UPYOG Property Tax Analytics Dashboard — a platform managing property tax records for 10 Indian cities: Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow.

The dataset has 1,000 property records with these fields: property_id, tenant (city), owner_name, property_type (Residential/Commercial/Industrial/Agricultural/Mixed Use), ward (Ward A–F), area_sqft, status (Approved/Pending/Rejected), annual_tax_inr, collection_inr, registration_date, floor_count, address.

Key Stats:
- Total: 1,000 properties across 10 cities
- Statuses: Approved (610), Pending (205), Rejected (185)
- Top city by collection: Mumbai (~₹3,58,746)
- Cities: Ahmedabad (108), Lucknow (109), Mumbai (106), Kolkata (106), Bengaluru (101), Jaipur (100), Chennai (100), Delhi (93), Hyderabad (91), Pune (86)

Rules:
- Answer questions about this property tax data accurately and concisely.
- Use ₹ for currency and Indian number formatting (lakhs/crores).
- Keep responses 2-4 sentences unless a detailed breakdown is requested.
- If asked something outside this dataset, say so politely.`;

const SUGGESTIONS = [
  "Which city has the highest collection?",
  "How many properties are pending?",
  "Show approval rate by city",
];

const ChatAssistant = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm your UPYOG AI assistant. Ask me anything about the property tax data — collections, approvals, city comparisons, and more!" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef  = useRef(null);
  const panelRef   = useRef(null);
  const inputRef   = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        !e.target.closest("#chat-fab")
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    const userMsg = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content },
    ];

    let responseText = null;

    if (VITE_MISTRAL_KEY) {
      try {
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${VITE_MISTRAL_KEY}` },
          body: JSON.stringify({ model: "mistral-small-latest", messages: apiMessages, max_tokens: 400, temperature: 0.4 }),
        });
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content;
      } catch (e) { console.warn("Mistral failed:", e.message); }
    }

    if (!responseText && VITE_GROQ_KEY) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${VITE_GROQ_KEY}` },
          body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: apiMessages, max_tokens: 400, temperature: 0.4 }),
        });
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content;
      } catch (e) { console.warn("Groq failed:", e.message); }
    }

    setMessages(prev => [...prev, {
      role: "ai",
      content: responseText || "AI temporarily unavailable. Please check your API keys in client/.env.",
    }]);
    setLoading(false);
  };

  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* FAB */}
      <motion.button
        id="chat-fab"
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #4f8ef7 0%, #7c3aed 100%)",
          boxShadow: "0 8px 32px rgba(79,142,247,0.4)",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{  opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-6 sm:w-[380px] z-50 flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface"
            style={{
              maxHeight: "min(560px, calc(100dvh - 110px))",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(128,128,128,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 bg-surface-container-high border-b border-outline-variant">
              {/* Animated icon */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #4f8ef7, #7c3aed)" }}>
                  <Bot size={19} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-surface-container-high" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-on-surface truncate">UPYOG AI Assistant</p>
                  <Sparkles size={11} className="text-amber-400 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium">Mistral · Groq fallback · Online</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-surface" style={{ minHeight: 0 }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mb-0.5 ${
                    m.role === "ai"
                      ? "text-primary"
                      : "text-white"
                  }`}
                    style={{
                      background: m.role === "ai"
                        ? "rgba(79,142,247,0.12)"
                        : "linear-gradient(135deg,#4f8ef7,#7c3aed)",
                    }}
                  >
                    {m.role === "ai" ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "ai"
                        ? "bg-surface-container-high text-on-surface rounded-bl-md"
                        : "text-white rounded-br-md"
                    }`}
                    style={m.role === "user" ? { background: "linear-gradient(135deg, #4f8ef7 0%, #7c3aed 100%)" } : {}}
                  >
                    {m.role === "ai" ? renderMarkdown(m.content) : m.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-primary"
                    style={{ background: "rgba(79,142,247,0.12)" }}>
                    <Bot size={14} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center bg-surface-container-high">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Suggestion chips */}
              {showSuggestions && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col gap-2 pt-1"
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1">Try asking</p>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-left text-xs px-3 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-3 border-t border-outline-variant bg-surface-container">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-surface border border-outline-variant transition-all">
                <input
                  id="chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask about properties, cities..."
                  className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant"
                  disabled={loading}
                />
                <motion.button
                  id="chat-send"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: "linear-gradient(135deg, #4f8ef7, #7c3aed)" }}
                >
                  <Send size={14} className="text-white" />
                </motion.button>
              </div>
              <p className="text-[9px] text-center text-on-surface-variant mt-2 opacity-50">
                AI responses are based on the 1,000-record dataset
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;

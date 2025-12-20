"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Mic,
  Paperclip,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001";

export default function ChatTab() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: {
        title: "👋 Ayubowan! Welcome to WanderWise",
        summary: 
          "I'm your WanderWise AI travel guide.  Ask me anything about Sri Lanka destinations, itineraries, transport options, activities, or budget tips! ",
        quick_replies: [
          "Best time to visit Sri Lanka? ",
          "Suggest a 3-day itinerary for Kandy",
        ],
      },
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Smooth scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const quickQuestions = [
    "Best time to visit Sri Lanka?",
    "Suggest a 3-day itinerary for Kandy",
    "Romantic activities for couples",
    "Budget travel tips in Sri Lanka",
  ];

  function extractJsonFromText(text) {
    if (!text) return null;
    
    // Strategy 1: Try to extract from markdown fence
    const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
      const candidate = fenced[1];
      try {
        return JSON.parse(candidate);
      } catch (e) {
        const cleaned = candidate.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        try {
          return JSON.parse(cleaned);
        } catch {
          // Continue to next strategy
        }
      }
    }
    
    // Strategy 2: Try to find JSON object in text
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const candidate = text.substring(start, end + 1);
        return JSON.parse(candidate);
      }
    } catch (e) {
      // Continue to next strategy
    }
    
    // Strategy 3: Try regex match
    const objMatch = text.match(/(\{[\s\S]*\})/);
    if (!objMatch) return null;
    
    const candidate = objMatch[1];
    try {
      return JSON.parse(candidate);
    } catch (e) {
      const cleaned = candidate.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
      try {
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }

  const sendMessage = async (directText) => {
    const text = (typeof directText === "string" ? directText : input).trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: new Date() },
    ]);

    if (! directText) setInput("");

    setIsTyping(true);
    setLoading(true);

    try {
      const history = messages. map((m) => {
        let content = m.content;
        if (typeof content === "object" && content !== null) {
          content = content.summary || content.body_markdown || JSON.stringify(content);
        }
        return { role: m.role, content };
      });

      const url = `${AI_API.replace(/\/$/, "")}/api/chatbot/chat`;
      console.log("📤 Sending chat to:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text, 
          history, 
          context: "travel-sri-lanka" 
        }),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res. json();
      console.log("📦 Parsed response:", data);

      // Extract structured content with multiple strategies
      let structuredContent = null;

      // Check if response has structured field
      if (data.structured && typeof data.structured === "object") {
        structuredContent = data.structured;
      } 
      // Check if response itself is structured
      else if (data.title || data.body_markdown || data.sections) {
        structuredContent = data;
      }
      // Try to parse from raw field
      else if (data.raw) {
        const extracted = extractJsonFromText(data. raw);
        if (extracted) {
          structuredContent = extracted;
        }
      }

      // Add message with structured or fallback content
      if (structuredContent) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: structuredContent,
            timestamp: new Date(),
          },
        ]);
        toast.success("Response received!");
      } else {
        // Ultimate fallback
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: {
              title:  "🗨️ WanderWise",
              body_markdown: data. raw || "I'm here to help! What would you like to know?  😊",
              quick_replies: [
                "Show me destinations",
                "Plan a 3-day trip",
                "Budget travel tips"
              ]
            },
            timestamp: new Date(),
          },
        ]);
      }

    } catch (err) {
      console.error("❌ Chat error:", err);
      toast.error("Failed to get response.  Please try again.");
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: {
            title: "⚠️ Connection Error",
            body_markdown:  "I couldn't reach the server.  Please check your connection and try again!  🔄",
            quick_replies: [
              "Try again",
              "Show me destinations"
            ]
          },
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (q) => {
    sendMessage(q);
  };

  const handleCta = (cta) => {
    if (!cta) return;
    if (cta. action === "open_map" && cta.data) {
      const { latitude, longitude, zoom } = cta.data;
      const url = `https://www.google.com/maps/@${latitude},${longitude},${zoom || 12}z`;
      window.open(url, "_blank");
      toast.success("Opening map.. .");
      return;
    }
    if (cta.data?.url) {
      window.open(cta.data.url, "_blank");
      toast.success("Opening link...");
    }
  };

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Custom markdown components:  inline style for <a> to override prose blue
  const mdComponents = {
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        style={{ color: "#E5E7EB", textDecoration: "underline" }}
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code style={{ 
        background: "rgba(255,255,255,0.08)", 
        color: "#EDEFF2", 
        padding: "0.12rem 0.4rem", 
        borderRadius: 4,
        fontSize: "0.9em"
      }}>
        {children}
      </code>
    ),
    ul: ({ children }) => (
      <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: "0.25rem" }}>
        {children}
      </li>
    ),
    p: ({ children }) => (
      <p style={{ marginBottom: "0.5rem" }}>
        {children}
      </p>
    ),
  };

  const renderStructuredContent = (obj) => {
    if (!obj) return null;
    return (
      <div className="prose prose-invert max-w-none text-gray-200">
        {obj.title && <div className="text-lg font-semibold mb-2">{obj.title}</div>}
        {obj.summary && (
          <div className="mb-3 text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {obj.summary}
            </ReactMarkdown>
          </div>
        )}

        {Array.isArray(obj.sections) &&
          obj.sections.map((s, idx) => (
            <div key={idx} className="mb-3">
              {s.heading && <div className="font-semibold text-gray-100 mb-1">{s.heading}</div>}
              <div className="text-sm text-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {s. body_markdown || ""}
                </ReactMarkdown>
              </div>
            </div>
          ))}

        {obj.body_markdown && ! obj.sections && (
          <div className="text-sm text-gray-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {obj.body_markdown}
            </ReactMarkdown>
          </div>
        )}

        {Array.isArray(obj.quick_replies) && obj.quick_replies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {obj.quick_replies. map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(q)}
                className="px-3 py-1. 5 rounded-full bg-white/10 hover:bg-white/20 text-sm cursor-pointer border border-white/10 backdrop-blur-xl text-gray-300 transition-all hover:scale-105"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {obj.cta && (
          <div className="mt-4">
            <button
              onClick={() => handleCta(obj.cta)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-cyan-600 transition-all hover:scale-105 shadow-md shadow-blue-500/20"
            >
              {obj.cta.label || "Open"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .chat-scrollbar {
          scroll-behavior: smooth;
        }
        
        .chat-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .chat-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: background 0.2s;
        }
        
        . chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Firefox */
        .chat-scrollbar {
          scrollbar-width:  thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div className="p-5 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">WanderWise Assistant</h2>
            <p className="text-sm text-blue-200">Your AI travel companion</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 p-5 overflow-y-auto space-y-4 chat-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages. map((msg, i) => {
            const isStructured =
              typeof msg.content === "object" && msg.content !== null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y:  10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-xl border shadow-lg ${msg.role === "assistant"
                    ? "bg-white/5 border-white/10 text-gray-200 shadow-blue-500/10"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent ml-auto"
                    }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {isStructured ? (
                    renderStructuredContent(msg.content)
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>
                  )}

                  <div className={`text-xs mt-3 ${msg.role === "user" ? "text-right" :  "text-left"} text-gray-400`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Bot className="w-4 h-4 text-white" />
            </div>

            <div className="px-4 py-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xl">
              <div className="flex gap-2">
                {[0, 0.2, 0.4]. map((d, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d }}
                    className="w-2 h-2 bg-blue-300 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* QUICK QUESTIONS */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-400 flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Try asking: 
          </p>

          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y:  10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setInput(q)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 text-xs backdrop-blur-xl transition-all hover:scale-105 cursor-pointer"
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT AREA */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-t from-gray-900/40 to-gray-800/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-gray-400 hover:text-blue-400 transition"
            onClick={() => toast.info("File upload coming soon!")}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button 
            className="p-2 text-gray-400 hover:text-blue-400 transition"
            onClick={() => toast.info("Voice input coming soon!")}
          >
            <Mic className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ! e.shiftKey && sendMessage()}
              placeholder="Ask anything about your trip..."
              disabled={loading}
              className="w-full px-4 py-3 pl-11 pr-12 rounded-xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus: ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <motion.button
            onClick={() => sendMessage()}
            disabled={! input. trim() || loading}
            whileHover={{ scale: input.trim() && ! loading ? 1.05 :  1 }}
            whileTap={{ scale: input.trim() && !loading ? 0.95 : 1 }}
            className={`p-3 rounded-xl shadow-md transition ${
              input.trim() && !loading
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-blue-500/20 cursor-pointer"
                : "bg-gray-600/40 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
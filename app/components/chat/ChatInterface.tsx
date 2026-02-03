"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X, Calendar, UserCheck } from "lucide-react";
import PricingCard from "./PricingCard";

interface Message {
  role: "user" | "assistant";
  content: string;
  showPricing?: boolean;
  isCode?: boolean;
}

// Remove unwanted symbols for AI
const sanitizeAiText = (text: string) =>
  text.replace(/[!@#$%^&*()+=[\]{}|<>~]/g, "").trim();

// Detect if the text is code
const isLikelyCode = (text: string) =>
  /(```|function\s|\bconst\b|\blet\b|\bimport\b|\bexport\b|\{|\}|;)/i.test(text);

function TypewriterText({
  text,
  speed = 10, // faster typing
}: {
  text: string;
  speed?: number;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayed}</>;
}

export default function ChatInterface({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Xovato! I'm here to help you with our digital solutions. How can I assist you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingText, isLoading]);

  // Type out AI messages
  const typeMessage = async (fullText: string, isCode?: boolean, showPricing?: boolean) => {
    setTypingText("");
    for (let i = 0; i < fullText.length; i++) {
      await new Promise((r) => setTimeout(r, 12)); // faster
      setTypingText((p) => p + fullText[i]);
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: fullText, isCode, showPricing },
    ]);
    setTypingText("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      isCode: isLikelyCode(input),
    };

    setMessages((p) => [...p, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiWorkerUrl = process.env.NEXT_PUBLIC_AI_WORKER_URL || "/api/chat";

      const res = await fetch(aiWorkerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      const cleanText = sanitizeAiText(data.content || "");

      const showPricing = /price|pricing|princes/i.test(userMessage.content);

      await typeMessage(cleanText, isLikelyCode(userMessage.content), showPricing);
    } catch {
      await typeMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_API_URL || "#";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 z-[999]
        flex h-[60vh] sm:h-[520px] w-[90vw] max-w-[340px]
        flex-col overflow-hidden rounded-3xl
        border border-white/10 bg-black/85 backdrop-blur-xl
        shadow-2xl ring-1 ring-white/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Xovato Assistant</h3>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400">
              Online
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-white/60 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="mt-1 mr-2 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <UserCheck size={12} />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-white/6 text-white/90 border border-white/10"}
                ${msg.isCode ? "font-mono text-xs whitespace-pre-wrap" : ""}
              `}
            >
              {msg.role === "assistant" && typingText && i === messages.length - 1 ? (
                <TypewriterText text={typingText} speed={8} />
              ) : (
                msg.content
              )}

              {msg.showPricing && <PricingCard />}
              {msg.role === "assistant" && /book|schedule/i.test(msg.content) && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-all active:scale-95 shadow-sm"
                >
                  <Calendar size={13} />
                  Book Consultation
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Typing animation bubble */}
        {isLoading && typingText && (
          <div className="flex justify-start">
            <div className="mt-1 mr-2 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <UserCheck size={12} />
            </div>
            <div className="bg-white/6 border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white/80 flex gap-1">
              {[...Array(3)].map((_, idx) => (
                <motion.span
                  key={idx}
                  animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.12 }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"
                />
              ))}
              <span className="ml-2">
                <TypewriterText text={typingText} speed={8} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-white/5 px-4 py-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="h-9 w-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

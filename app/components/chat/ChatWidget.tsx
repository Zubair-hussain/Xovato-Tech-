"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Sparkles } from "lucide-react";
import ChatInterface from "./ChatInterface";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Safe initial constraints (fallback values used during SSR)
  const [dragConstraints, setDragConstraints] = useState({
    top: -400,
    bottom: 400,
    left: -400,
    right: 400,
  });

  // Set real viewport-based constraints only on client
  useEffect(() => {
    const updateConstraints = () => {
      setDragConstraints({
        top: -window.innerHeight + 100, // Keep ~100px visible at top
        bottom: 0,
        left: -window.innerWidth + 100, // Keep ~100px visible at left
        right: 0, // Don't allow going off-screen to the right
      });
    };

    updateConstraints();

    // Optional: update on window resize
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  return (
    <motion.div
      // Initial offset from bottom-right corner
      initial={{ x: -20, y: -80 }}
      drag
      dragElastic={0.15}
      dragConstraints={dragConstraints}
      whileDrag={{ scale: 1.08, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
    >
      {/* The floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: isOpen ? 0 : 5 }}
        whileTap={{ scale: 0.92 }}
        className={`relative group flex h-11 w-11 sm:h-12 sm:w-12 
          items-center justify-center rounded-xl border transition-all duration-300
          ${isOpen
            ? "bg-zinc-900 border-white/30 text-white shadow-xl"
            : "bg-gradient-to-br from-emerald-600 to-emerald-500 text-black shadow-lg border-transparent"
          }`}
      >
        <div className="absolute inset-0 rounded-xl bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              className="relative"
            >
              <div className="absolute -top-6 -left-6 pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="text-emerald-300"
                >
                  <Sparkles size={24} />
                </motion.div>
              </div>
              <MessageSquareText size={24} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip label when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-0 right-16 px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white text-xs font-bold whitespace-nowrap shadow-xl pointer-events-none hidden sm:block"
          >
            Talk to Xovato AI 🤖
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black border-r border-t border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute bottom-full right-0 mb-4 w-[380px] sm:w-[390px] h-[580px] max-h-[65vh]"
          >
            <ChatInterface onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
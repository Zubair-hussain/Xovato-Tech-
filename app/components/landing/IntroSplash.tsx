"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  brand?: string;
  oncePerSession?: boolean;
};

export default function IntroSplash({ brand = "Xovato", oncePerSession = true }: Props) {
  const [show, setShow] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Check session
    if (oncePerSession) {
      if (typeof sessionStorage !== "undefined") {
        const seen = sessionStorage.getItem("intro_seen");
        if (seen === "1") {
          setComplete(true);
          return;
        }
        sessionStorage.setItem("intro_seen", "1");
      }
    }
    setShow(true);
  }, [oncePerSession]);

  if (complete || !show) return null;

  return (
    <AnimatePresence onExitComplete={() => setComplete(true)}>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black px-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: "easeInOut" } }}
          onAnimationComplete={() => {
            // After a delay, exit
            setTimeout(() => setShow(false), 3200);
          }}
        >
          {/* Background Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] bg-emerald-500/10 blur-[100px] rounded-full"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">

            {/* FRAME & X LOGO */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6">
              {/* Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 border border-white/10 rounded-3xl shadow-2xl bg-white/[0.02]"
              />

              {/* X Stroke 1 */}
              <motion.div
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full p-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <motion.path
                    d="M20 20 L80 80"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "circOut" }}
                  />
                  <motion.path
                    d="M80 20 L20 80"
                    stroke="#34d399"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "circOut" }}
                  />
                </svg>
              </motion.div>
            </div>

            {/* TEXT REVEAL */}
            <div className="overflow-hidden flex items-baseline gap-1">
              <motion.span
                initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl font-black tracking-tighter text-white"
              >
                X
              </motion.span>
              <motion.span
                initial={{ x: -20, opacity: 0, filter: "blur(10px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl font-bold tracking-tight text-white/90"
              >
                ovato
              </motion.span>
            </div>

            {/* SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 0.5, letterSpacing: "0.4em" }}
              transition={{ delay: 1.6, duration: 1.5, ease: "easeOut" }}
              className="mt-3 text-xs sm:text-sm font-bold uppercase text-white"
            >
              Start The Future
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

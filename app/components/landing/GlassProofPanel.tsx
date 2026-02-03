"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// ✅ Fixed typo in import path (MeanuItem -> MenuItem)
import MenuItem from "./MenuItem";
import ShinyText from "./globe/ShinyText";
import WorkWithUsModal from "../client/WorkWithUsModal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MENU_ITEMS = [
  {
    title: "Transparency",
    paragraph: "Clear communication and honest work come first. Every project is handled responsibly, with full transparency and attention to detail.",
    images: [
      "https://images.unsplash.com/photo-1521791136064-7985c2d18854?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80",
    ],
    link: "#transparency",
  },
  {
    title: "Clarity",
    paragraph: "Your ideas and time are valued. Every decision is made thoughtfully, feedback is taken seriously, and collaboration stays professional.",
    images: [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=600&q=80",
    ],
    link: "#clarity",
  },
  {
    title: "Momentum",
    paragraph: "Work moves quickly without cutting corners. Processes are streamlined, timelines are realistic, and progress stays consistent.",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1502086223501-681a91e9b08b?auto=format&fit=crop&w=600&q=80",
    ],
    link: "#momentum",
  },
];

export default function GlassProofPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const n50Ref = useRef<HTMLSpanElement>(null);
  const n1kRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hasPlayedRef = useRef(false);
  const [isWorkWithUsOpen, setIsWorkWithUsOpen] = useState(false);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const glow = glowRef.current;
    if (!panel) return;

    // Use a context to easily revert animations on unmount
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(panel, { autoAlpha: 0, y: 28, scale: 0.985 });
      if (glow) gsap.set(glow, { autoAlpha: 0, scale: 0 });

      const playOnce = () => {
        if (hasPlayedRef.current) return;
        hasPlayedRef.current = true;

        // Animate Panel
        gsap.to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" });
        // Animate Glow (delayed slightly)
        if (glow) gsap.to(glow, { autoAlpha: 1, scale: 1, duration: 1.15, ease: "power3.out", delay: 0.05 });

        // Counter Animations
        const a = { v: 0 };
        const b = { v: 0 };
        if (n50Ref.current) n50Ref.current.textContent = "0";
        if (n1kRef.current) n1kRef.current.textContent = "0";

        gsap.to(a, {
          v: 50,
          duration: 1.25,
          ease: "power2.out",
          onUpdate: () => { if (n50Ref.current) n50Ref.current.textContent = `${Math.round(a.v)}`; },
        });

        gsap.to(b, {
          v: 1000,
          duration: 1.25,
          ease: "power2.out",
          onUpdate: () => {
            if (!n1kRef.current) return;
            const val = Math.round(b.v);
            n1kRef.current.textContent = val >= 1000 ? "1k+" : `${val}`;
          },
        });

        // Stagger in content
        const items = panel.querySelectorAll<HTMLElement>("[data-para]");
        gsap.fromTo(items, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.08 });
      };

      ScrollTrigger.create({
        trigger: panel,
        start: "top 85%",
        once: true,
        onEnter: playOnce,
      });
    }, panel);

    return () => ctx.revert();
  }, []);

  return (
    // ✅ FIX 1: Changed 'overflow-x-hidden' to 'overflow-hidden' to catch ALL scrollbars immediately
    <div className="mt-20 w-full flex justify-center px-4 overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap'); .font-syne { font-family: 'Syne', sans-serif; }`}</style>

      {/* ✅ FIX 2: Added 'overflow-hidden' directly to the Tailwind classes here.
          This ensures clipping happens instantly, before the <style jsx> loads. */}
      <div ref={panelRef} className="glass-shell relative w-full max-w-5xl opacity-0 overflow-hidden">
        <div className="glass-border" />
        <div className="glass-shine-top" />
        <div className="glass-shine-left" />
        <div className="glass-inner" />

        <div ref={glowRef} className="glass-glow-wrapper">
          <div className="glass-water" />
        </div>

        <div className="glass-content relative z-10 px-5 py-8 sm:px-10 sm:py-12 md:px-14 md:py-14">
          <h2 className="mb-5 text-2xl font-bold text-white sm:text-3xl md:text-5xl glass-text" data-para>
            About our team
          </h2>
          <div className="space-y-4 text-white/90" data-para>
            <p className="text-sm leading-relaxed sm:text-base md:text-lg glass-text-soft">
              We build modern, high-performance digital products with clean UI, solid architecture, and strong attention
              to detail — from landing pages to full web apps.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-5 sm:flex sm:flex-row sm:gap-10" data-para>
            <div>
              <div className="text-3xl font-bold text-white sm:text-4xl md:text-5xl glass-text">
                <span ref={n50Ref}>0</span>+
              </div>
              <div className="mt-1 text-white/70 text-xs sm:text-sm glass-text-soft">Team Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white sm:text-4xl md:text-5xl glass-text">
                <span ref={n1kRef}>0</span>
              </div>
              <div className="mt-1 text-white/70 text-xs sm:text-sm glass-text-soft">Projects Completed</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWorkWithUsOpen(true)}
            data-para
            className="mt-7 inline-flex w-fit items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md transition hover:-translate-y-[1px] hover:bg-white/14"
          >
            <ShinyText text="Work with us" speedMs={1600} pauseOnHover className="font-semibold tracking-wide" />
          </button>

          <div className="mt-12" data-para>
            <h4 className="font-syne font-bold text-[11px] uppercase tracking-widest mb-6 border-b border-white/10 pb-3 inline-block">
              <span className="values-gradient">Our Values</span>
            </h4>
            <div className="flex flex-col">
              {MENU_ITEMS.map((item, idx) => (
                <MenuItem key={idx} {...item} isFirst={idx === 0} />
              ))}
            </div>
          </div>
        </div>

        {/* --- Styles --- */}
        <style jsx>{`
          /* Note: We kept overflow:hidden here, but adding it to the className above is what fixes the flash */
          .glass-shell {
            position: relative;
            width: 100%;
            max-width: 72rem;
            margin: 0 auto;
            border-radius: 28px;
            overflow: hidden; 
            min-height: 320px;
            isolation: isolate;
          }

          .glass-glow-wrapper {
            position: absolute;
            top: -120px;
            right: -120px;
            width: 450px;
            height: 450px;
            z-index: 1;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translateZ(0);
          }

          @media (max-width: 640px) {
            .glass-shell {
              border-radius: 22px;
              min-height: auto;
            }
            .glass-glow-wrapper {
              top: -80px;
              right: -80px;
              width: 280px;
              height: 280px;
              opacity: 0.9;
            }
          }

          @media (min-width: 641px) and (max-width: 1023px) {
            .glass-glow-wrapper {
              top: -95px;
              right: -95px;
              width: 360px;
              height: 360px;
            }
          }

          .glass-water {
            width: 100%;
            height: 100%;
            background: radial-gradient(
              circle at 50% 50%,
              rgba(34, 197, 94, 0.3) 0%,
              rgba(34, 197, 94, 0.1) 40%,
              rgba(34, 197, 94, 0) 70%
            );
            border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
            filter: blur(50px);
            animation: water-move 10s infinite linear;
          }

          @media (max-width: 640px) {
            .glass-water {
              filter: blur(40px);
            }
          }

          @keyframes water-move {
            0% {
              border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
              transform: rotate(0deg);
            }
            33% {
              border-radius: 40% 60% 42% 58% / 41% 51% 49% 59%;
            }
            66% {
              border-radius: 73% 27% 59% 41% / 52% 38% 62% 48%;
            }
            100% {
              border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
              transform: rotate(360deg);
            }
          }

          .glass-border {
            position: absolute;
            inset: 0;
            border-radius: 28px;
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.22),
              rgba(255, 255, 255, 0.08) 28%,
              rgba(255, 255, 255, 0.06) 60%,
              rgba(255, 255, 255, 0.12)
            );
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55),
              inset 0 1px 0 rgba(255, 255, 255, 0.28),
              inset 0 -1px 0 rgba(255, 255, 255, 0.1);
            opacity: 1;
          }

          @media (max-width: 640px) {
            .glass-border {
              border-radius: 22px;
            }
          }

          .glass-inner {
            position: absolute;
            inset: 10px;
            border-radius: 22px;
            background: rgba(12, 14, 13, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(18px) saturate(1.2);
            -webkit-backdrop-filter: blur(18px) saturate(1.2);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 18px 42px rgba(0, 0, 0, 0.45);
          }

          @media (max-width: 640px) {
            .glass-inner {
              inset: 8px;
              border-radius: 18px;
            }
          }

          .glass-shine-top {
            position: absolute;
            left: 26px;
            right: 26px;
            top: 16px;
            height: 18px;
            border-radius: 999px;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.26),
              rgba(255, 255, 255, 0)
            );
            opacity: 0.9;
            pointer-events: none;
          }

          @media (max-width: 640px) {
            .glass-shine-top {
              left: 18px;
              right: 18px;
              top: 12px;
              height: 14px;
              opacity: 0.75;
            }
          }

          .glass-shine-left {
            position: absolute;
            top: 28px;
            bottom: 28px;
            left: 14px;
            width: 14px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0));
            opacity: 0.55;
            pointer-events: none;
          }

          @media (max-width: 640px) {
            .glass-shine-left {
              top: 18px;
              bottom: 18px;
              left: 10px;
              width: 10px;
              opacity: 0.45;
            }
          }

          .glass-content {
            position: relative;
            z-index: 2;
          }

          .glass-text {
            text-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);
          }
          .glass-text-soft {
            text-shadow: 0 10px 20px rgba(0, 0, 0, 0.45);
          }

          .values-gradient {
            background: linear-gradient(90deg, #10b981 0%, #06b6d4 55%, #10b981 100%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 6px 24px rgba(16, 185, 129, 0.22);
          }
        `}</style>
      </div>

      <WorkWithUsModal
        isOpen={isWorkWithUsOpen}
        onClose={() => setIsWorkWithUsOpen(false)}
        isModal
      />
    </div>
  );
}
"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline for the text reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // 1. Text Mask Reveal
      tl.from(".reveal-text", {
        y: "100%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      })
        // 2. Paragraph Fade In
        .from(
          textRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.6"
        )
        // 3. Stats Stagger
        .from(
          ".stat-anim",
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.8"
        )
        // 4. Cards Stagger
        .from(
          ".card-anim",
          {
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.6"
        );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      // ✅ CHANGED: bg-neutral-900 -> bg-black (Matches Sections.tsx)
      className="relative z-10 w-full bg-black py-20 text-white sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

          {/* --- Left Column: Text Content --- */}
          <div className="flex flex-col justify-center">
            {/* Animated Label */}
            <div className="mb-4 overflow-hidden">
              {/* ✅ CHANGED: text-indigo-400 -> text-emerald-400 */}
              <span className="reveal-text block text-sm font-bold uppercase tracking-widest text-emerald-400">
                Who We Are
              </span>
            </div>

            {/* Animated Heading */}
            <h2
              ref={titleRef}
              className="mb-6 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl"
            >
              <div className="overflow-hidden">
                <span className="reveal-text block">Building Digital Products</span>
              </div>
              <div className="overflow-hidden">
                <span className="reveal-text block">
                  That <span className="text-emerald-500">Users Love.</span>
                </span>
              </div>
            </h2>

            <p ref={textRef} className="mb-8 text-lg leading-relaxed text-white/70">
              We are <strong>XOVATO</strong>, a full-service digital agency with over{" "}
              <span className="text-emerald-300">3+ years of experience</span>. Our team of{" "}
              <span className="text-emerald-300">10+ specialized developers</span> is trained not
              just to write code, but to create experiences.
              <br />
              <br />
              From high-performance <strong>Websites</strong> and <strong>Mobile Apps</strong> to
              engaging <strong>Video Editing</strong>, we ensure your brand stands out. We integrate
              advanced <strong>SEO</strong> strategies and fluid animations to guarantee your platform
              doesn't just look good—it gets multiple users and converts them into customers.
            </p>

            {/* Stats Row */}
            <div ref={statsRef} className="flex gap-10 border-t border-white/10 pt-8">
              <div className="stat-anim">
                <h3 className="text-4xl font-bold text-white">3+</h3>
                <p className="text-sm text-white/50">Years Experience</p>
              </div>
              <div className="stat-anim">
                <h3 className="text-4xl font-bold text-white">10+</h3>
                <p className="text-sm text-white/50">Expert Developers</p>
              </div>
              <div className="stat-anim">
                <h3 className="text-4xl font-bold text-white">100%</h3>
                <p className="text-sm text-white/50">Client Satisfaction</p>
              </div>
            </div>
          </div>

          {/* --- Right Column: Services Grid --- */}
          <div ref={cardsRef} className="grid gap-4 sm:grid-cols-2">
            <ServiceCard
              title="Web Development"
              desc="Fast, responsive, and loved by users."
              icon="💻"
            />
            <ServiceCard
              title="Mobile Apps"
              desc="React Native solutions for iOS & Android."
              icon="📱"
            />
            <ServiceCard
              title="SEO & Growth"
              desc="Strategies to get multiple users to your post."
              icon="🚀"
            />
            <ServiceCard
              title="Video Editing"
              desc="Cinematic edits that capture attention."
              icon="🎬"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ✅ CHANGED: Updated hover colors to Emerald to match Sections.tsx
function ServiceCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="card-anim group rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-emerald-500/40 hover:bg-white/[0.08]">
      <div className="mb-4 text-3xl text-emerald-300 group-hover:text-emerald-400 transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
        {desc}
      </p>
    </div>
  );
}
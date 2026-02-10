"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import { gsap } from "gsap";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80";

/* ------------------------- HELPER: IMAGE PILL ------------------------- */
const ImagePill = ({ src, fallback }: { src: string; fallback: string }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div
      className="
        relative overflow-hidden
        bg-black/20 rounded-full
        mx-4 sm:mx-6 md:mx-8
        w-16 h-8 sm:w-24 sm:h-11 md:w-32 md:h-14
        flex-shrink-0
      "
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt="topic"
        onError={() => setImgSrc(fallback)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

/* ------------------------- MAIN COMPONENT ------------------------- */
interface MenuItemProps {
  title: string;
  paragraph: string;
  images: string[];
  link: string;
  isFirst: boolean;
}

const MenuItem = ({ title, paragraph, images, link, isFirst }: MenuItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);

  const loopRef = useRef<gsap.core.Tween | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [repetitions, setRepetitions] = useState(2);

  const segments = useMemo(() => {
    return paragraph
      .split(".")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [paragraph]);

  const isTouchRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    isTouchRef.current =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      window.matchMedia?.("(hover: none)").matches;
  }, []);

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ): "top" | "bottom" => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  useLayoutEffect(() => {
    const calc = () => {
      const inner = marqueeInnerRef.current;
      if (!inner) return;
      const part = inner.querySelector(".marquee-part") as HTMLElement | null;
      if (!part) return;

      const w = part.offsetWidth || 1;
      // Reduce repetitions on mobile to save DOM elements
      const multiplier = window.innerWidth < 768 ? 1.2 : 2;
      const needed = Math.ceil(window.innerWidth / w) + multiplier;
      setRepetitions(Math.max(2, Math.floor(needed)));
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [title, paragraph, images]);

  useLayoutEffect(() => {
    const overlay = marqueeRef.current;
    const inner = marqueeInnerRef.current;
    if (!overlay || !inner) return;

    const setup = () => {
      const part = inner.querySelector(".marquee-part") as HTMLElement | null;
      if (!part) return;

      const contentWidth = part.offsetWidth;
      if (!contentWidth) return;

      loopRef.current?.kill();

      gsap.set(overlay, { y: "101%", autoAlpha: 0 });
      gsap.set(inner, { x: 0, y: 0 });

      const duration = Math.max(20, contentWidth / 100);

      loopRef.current = gsap.to(inner, {
        x: -contentWidth,
        duration,
        ease: "none",
        repeat: -1,
        paused: true,
      });
    };

    const t = window.setTimeout(setup, 100);
    return () => {
      window.clearTimeout(t);
      loopRef.current?.kill();
      loopRef.current = null;
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [title, paragraph, images, repetitions]);

  const showOverlay = (edge: "top" | "bottom") => {
    const overlay = marqueeRef.current;
    const inner = marqueeInnerRef.current;
    if (!overlay || !inner) return;

    tlRef.current?.kill();
    tlRef.current = gsap.timeline({ defaults: { duration: 0.55, ease: "expo.out" } });

    tlRef.current
      .set(overlay, { autoAlpha: 1 }, 0)
      .set(overlay, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(inner, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([overlay, inner], { y: "0%", overwrite: "auto" }, 0);

    loopRef.current?.play(0);
  };

  const hideOverlay = (edge: "top" | "bottom") => {
    const overlay = marqueeRef.current;
    const inner = marqueeInnerRef.current;
    if (!overlay || !inner) return;

    loopRef.current?.pause();

    tlRef.current?.kill();
    tlRef.current = gsap.timeline({
      defaults: { duration: 0.28, ease: "power3.in" },
      onComplete: () => {
        gsap.set(overlay, { autoAlpha: 0, y: "101%" });
        gsap.set(inner, { x: 0, y: 0 });
        loopRef.current?.pause(0);
      },
    });

    tlRef.current
      .to(overlay, { y: edge === "top" ? "-101%" : "101%", overwrite: "auto" }, 0)
      .to(inner, { y: edge === "top" ? "101%" : "-101%", overwrite: "auto" }, 0);
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTouchRef.current) return;
    const item = itemRef.current;
    if (!item) return;
    const rect = item.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    showOverlay(edge);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTouchRef.current) return;
    const item = itemRef.current;
    if (!item) return;
    const rect = item.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    hideOverlay(edge);
  };

  useEffect(() => {
    const onScroll = () => {
      if (isTouchRef.current) return;
      const overlay = marqueeRef.current;
      if (!overlay) return;
      const visible = gsap.getProperty(overlay, "autoAlpha") as number;
      if (visible > 0.01) {
        loopRef.current?.pause(0);
        gsap.set(overlay, { autoAlpha: 0, y: "101%" });
        if (marqueeInnerRef.current) gsap.set(marqueeInnerRef.current, { x: 0, y: 0 });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={itemRef}
      className="relative overflow-hidden"
      style={{ borderTop: isFirst ? "none" : "1px solid rgba(255,255,255,0.1)" }}
    >
      <a
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 block no-underline cursor-pointer px-4 py-6 sm:px-5 sm:py-7 md:px-4 md:py-8"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <span
              className="font-syne font-bold uppercase tracking-tight text-white text-2xl sm:text-3xl md:text-5xl leading-[1.05]"
              style={{ wordBreak: "break-word" }}
            >
              {title}
            </span>
            <span className="text-emerald-400 text-lg sm:text-xl md:text-2xl shrink-0">↗</span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-light max-w-[40rem] leading-relaxed">
            {paragraph}
          </p>
        </div>
      </a>

      <div
        ref={marqueeRef}
        className="absolute inset-0 bg-emerald-500 pointer-events-none translate-y-[101%] z-20"
        style={{ willChange: "transform, opacity" }}
      >
        <div
          ref={marqueeInnerRef}
          className="h-full w-fit flex items-center whitespace-nowrap"
          style={{ willChange: "transform" }}
        >
          {Array.from({ length: repetitions }).map((_, i) => (
            <div key={i} className="marquee-part flex items-center flex-shrink-0">
              {segments.map((segment, segIdx) => {
                const currentImage = images[segIdx % images.length];
                return (
                  <React.Fragment key={segIdx}>
                    <span
                      className="
                        font-syne font-bold text-black
                        text-xl sm:text-2xl md:text-3xl
                        whitespace-nowrap leading-none
                      "
                    >
                      {segment}
                    </span>
                    <ImagePill src={currentImage} fallback={FALLBACK_IMAGE} />
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
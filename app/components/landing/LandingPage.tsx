"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react"; // Suspense import add kiya
import Navbar from "./Navbar";
import Sections from "./Sections";
import ScrollCTA from "./ScrollCTA";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [showScrollCta, setShowScrollCta] = useState(false);
  const [navSolid, setNavSolid] = useState(false);

  const servicesBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);

  // Sync Lenis with GSAP ScrollTrigger
  useLenis((lenis) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 420);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on outside click / Esc
  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        servicesOpen &&
        servicesBtnRef.current &&
        !servicesBtnRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setServicesOpen(false);
      }
    };

    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };

    window.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("keydown", closeOnEsc);

    return () => {
      window.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, [servicesOpen]);

  // Update UI on scroll via Lenis
  useLenis(({ scroll }) => {
    setShowScrollCta(scroll > 140);
    setNavSolid(scroll > 18);
  });

  // Custom scrollTo with navbar offset
  const scrollTo = (
    target: string | HTMLElement | number,
    options: any = {}
  ) => {
    if (!lenisRef.current?.lenis) {
      // Native fallback
      let y: number;
      if (typeof target === "number") {
        y = target;
      } else {
        const el =
          typeof target === "string"
            ? document.getElementById(target.replace("#", ""))
            : target;
        if (!el) return;
        y =
          (el as HTMLElement).getBoundingClientRect().top +
          window.scrollY -
          64 - // navbar height
          24; // extra offset
      }
      window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }

    const navbarHeight = 64;
    const extra = 24;
    const offset = -(navbarHeight + extra);

    lenisRef.current.lenis.scrollTo(target, {
      ...options,
      offset,
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      autoRaf={true}
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      <div className="relative min-h-screen bg-black text-white">
        <Navbar
          navSolid={navSolid}
          servicesOpen={servicesOpen}
          setServicesOpen={setServicesOpen}
          servicesBtnRef={servicesBtnRef}
          panelRef={panelRef}
          scrollTo={scrollTo}
        />

        <main>
          {/* Suspense yahan add kiya – Sections ke andar useSearchParams ko cover karega */}
          <Suspense
            fallback={
              <div className="min-h-[80vh] flex items-center justify-center text-white/60">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p>Loading sections...</p>
                </div>
              </div>
            }
          >
            <Sections loaded={loaded} />
          </Suspense>

          <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row">
              <span>© {year} XOVATO. All rights reserved.</span>
              <span className="text-white/50">build With XOVATO Tech With Love</span>
            </div>
          </footer>
        </main>

        <ScrollCTA show={showScrollCta} />
      </div>
    </ReactLenis>
  );
}
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn"; // Adjust path if necessary
import { SERVICES } from "../../lib/constants"; // Adjust path if necessary
import { AnimatePresence, motion } from "framer-motion";
import { Coins } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  navSolid: boolean; // Kept for prop compatibility, though background is now transparent
  servicesOpen: boolean;
  setServicesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  servicesBtnRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  scrollTo: (target: string, options?: any) => void;
  scrollProg: number;
};

export default function Navbar({
  navSolid,
  servicesOpen,
  setServicesOpen,
  servicesBtnRef,
  panelRef,
  scrollTo,
  scrollProg,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Hide Navbar on Admin Pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Wrapper to handle clicking links (uses passed scrollTo function)
  const handleScrollClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollTo(`#${id}`);

      // Close mobile menus if open
      if (mobileOpen) {
        setMobileOpen(false);
        setMobileServicesOpen(false);
      }
    },
    [scrollTo, mobileOpen]
  );

  // Close mobile panel on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setMobileOpen(false);
        setMobileServicesOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);


  // Dropdown list animations (desktop)
  const listVariants = useMemo(
    () => ({
      closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
      open: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      closed: { opacity: 0, x: -10, filter: "blur(4px)" },
      open: { opacity: 1, x: 0, filter: "blur(0px)" },
    }),
    []
  );

  const setMagicXY = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--x", `${x}%`);
    el.style.setProperty("--y", `${y}%`);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500 bg-transparent"
    >
      {/* Note: Removed background layers as requested for transparency */}
      <div className="pointer-events-none absolute inset-0 bg-transparent" />

      {/* Mobile-only scroll progress bar */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 md:hidden">
        <div
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,95,70,0.0), rgba(16,185,129,0.75), rgba(167,243,208,0.0))",
            boxShadow: "0 0 20px rgba(16,185,129,0.35)",
            transformOrigin: "left",
            transform: `scaleX(${Math.min(1, Math.max(0, scrollProg / 100))})`,
          }}
        />
      </div>

      <nav className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-center px-4 sm:px-6">

        {/* ────────────── DESKTOP CENTRAL LAYOUT ────────────── */}
        {/* [About] -- [Logo] -- [Services] centered together */}
        <div className="hidden md:flex items-center gap-12">

          {/* 1. About */}
          <Link href="/about" className="navlink group">
            <span className="relative">
              About
              <span className="navlink-glow" />
            </span>
          </Link>

          {/* 2. Logo */}
          <Link href="/" className="relative z-50 flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo-f.jpeg"
              alt="XOVATO Logo"
              width={120}
              height={40}
              className="object-contain" // ensures aspect ratio
              priority
            />
          </Link>

          {/* 3. Services Dropdown */}
          <div className="relative">
            <motion.button
              ref={servicesBtnRef}
              type="button"
              className={cn(
                "navlink inline-flex items-center gap-2 group",
                servicesOpen && "text-white"
              )}
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative">
                Services
                <span className="navlink-glow" />
              </span>
              <motion.span
                className="navdot"
                animate={{
                  opacity: servicesOpen ? 1 : 0.55,
                  scale: servicesOpen ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  ref={panelRef}
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 top-[52px] w-[380px] origin-top"
                >
                  <div className="dropdownGlass">
                    <div className="p-5">
                      <motion.div
                        className="mb-4 flex items-center justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="text-xs font-bold tracking-widest text-emerald-400/90">
                          SERVICES • STEP BY STEP
                        </div>
                        <div className="ml-3 h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                      </motion.div>

                      <motion.ol
                        variants={listVariants}
                        initial="closed"
                        animate="open"
                        className="relative ml-2 space-y-4 border-l-2 border-emerald-400/20 pl-6"
                      >
                        {SERVICES.map((s, i) => (
                          <motion.li
                            key={s}
                            variants={itemVariants}
                            transition={{
                              duration: 0.4,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="relative group"
                            whileHover={{ x: 4 }}
                          >
                            <motion.span
                              className="stepDot"
                              whileHover={{ scale: 1.3 }}
                              transition={{ duration: 0.2 }}
                            />
                            <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {String(i + 1).padStart(2, "0")}. {s}
                            </div>
                            <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                              Clean UI • Fast • Business focused
                            </div>
                          </motion.li>
                        ))}
                      </motion.ol>

                      <Link
                        href="/services"
                        className="magicOutline mt-5 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-bold text-emerald-200"
                        onMouseMove={setMagicXY}
                        onClick={() => {
                          setServicesOpen(false);
                        }}
                      >
                        Explore services
                      </Link>
                    </div>

                    <div className="border-t border-white/10 bg-white/5 px-4 py-2.5 text-[11px] text-white/60">
                      💡 Tip: Click "Explore services" to jump to the full section.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


        {/* ────────────── MOBILE LAYOUT ────────────── */}

        {/* Mobile Logo (Absolute Center) */}
        <div className="md:hidden absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <Image
              src="/logo-f.jpeg"
              alt="XOVATO Logo"
              width={100}
              height={34}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Mobile Menu Toggle (Absolute Right) */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => {
            setMobileOpen((v) => !v);
            if (mobileOpen) setMobileServicesOpen(false);
          }}
          className={cn(
            "md:hidden absolute right-4 rounded-xl bg-white/5 px-3 py-2 transition",
            mobileOpen && "bg-white/10"
          )}
        >
          {/* 3-line animated icon */}
          <div className="relative h-4 w-6">
            <motion.span
              className="absolute left-0 top-0 h-[2px] w-6 rounded-full bg-emerald-300"
              animate={mobileOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.22 }}
            />
            <motion.span
              className="absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-emerald-300"
              animate={mobileOpen ? { opacity: 0, scaleX: 0.6 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.18 }}
            />
            <motion.span
              className="absolute left-0 bottom-0 h-[2px] w-6 rounded-full bg-emerald-300"
              animate={mobileOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.22 }}
            />
          </div>
        </button>
      </nav>

      {/* MOBILE PANEL (in the same file) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobilePanelRef}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden"
          >
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="mb-4 rounded-2xl border border-white/10 bg-black/95 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.75)]">
                {/* Row layout (NOT column) */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/about"
                    className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    About
                  </Link>

                  <button
                    type="button"
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className={cn(
                      "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      mobileServicesOpen
                        ? "bg-white/10 text-white"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    )}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      Services
                      <span className={cn("navdot", mobileServicesOpen ? "opacity-100" : "opacity-60")} />
                    </span>
                  </button>

                </div>

                {/* Services (mobile) */}
                <AnimatePresence>
                  {mobileServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs font-bold tracking-widest text-emerald-300/90">
                            SERVICES • STEP BY STEP
                          </div>
                          <div className="ml-3 h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                        </div>

                        {/* Scroll area with green scrollbar */}
                        <div className="max-h-56 overflow-y-auto pr-2 scrollbar-emerald">
                          <ol className="relative ml-2 space-y-3 border-l-2 border-emerald-400/20 pl-6">
                            {SERVICES.map((s, i) => (
                              <li key={s} className="relative">
                                <span className="stepDot" />
                                <div className="text-sm font-bold text-white">
                                  {String(i + 1).padStart(2, "0")}. {s}
                                </div>
                                <div className="text-xs text-white/60">
                                  Clean UI • Fast • Business focused
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <Link
                          href="/services"
                          className="magicOutline mt-3 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-bold text-emerald-200"
                          onMouseMove={setMagicXY}
                          onClick={() => {
                            setMobileServicesOpen(false);
                            setMobileOpen(false);
                          }}
                        >
                          Explore services
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
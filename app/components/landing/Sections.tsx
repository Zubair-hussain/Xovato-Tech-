"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "../../lib/cn";
import { playfair } from "@/app/fonts";
import { useTranslation } from "react-i18next";

// Component Imports
import GlassProofPanel from "./GlassProofPanel";
import GlobeWidgetWrapper from "./globe/GlobeWidgetWrapper";
import AgencyProcessSection from "./AgencyProcessSection";
import ContactInterface from "../client/ContactInterface";

// Dynamic Imports
const Rings3D = dynamic(() => import("./Rings3D"), {
  ssr: false,
  loading: () => <div className="h-[280px] w-[280px] md:h-[420px] md:w-[420px] bg-transparent" />,
});

/* ------------------------- MAIN SECTIONS COMPONENT ------------------------- */
export default function Sections({ loaded }: { loaded: boolean }) {
  const { t } = useTranslation();
  const [businessHover, setBusinessHover] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const rocketCursor = useMemo(() => {
    const rocketEmoji = "\uD83D\uDE80";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text x="6" y="24" font-size="22">${rocketEmoji}</text></svg>`;
    const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
    return `url("data:image/svg+xml,${encoded}") 16 16, auto`;
  }, []);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 md:pb-28 md:pt-32">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div
            className={cn(
              "transition-all duration-700",
              loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            )}
          >
            <h1 className="text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Innovative Digital Solutions to{" "}
              <span className="text-emerald-300">Grow Your </span>
              <span
                className={cn("text-emerald-300 transition-all duration-300", playfair.className)}
                style={{ cursor: businessHover ? rocketCursor : "pointer" }}
                onMouseEnter={() => setBusinessHover(true)}
                onMouseLeave={() => setBusinessHover(false)}
              >
                {t("business")}
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              Xovato Tech Services – Building fast, beautiful, and results-driven websites, apps, and brands.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <button
                onClick={() => setIsContactOpen(true)}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full p-[2px] transition-transform duration-300 hover:scale-105"
              >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#10b981_50%,#000000_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-8 py-1 text-sm font-bold tracking-wide text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-zinc-900">
                  Schedule a Call
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>

              <a
                href="/landing/viewcase"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full p-[2px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full border border-emerald-500/40 bg-black px-8 py-1 text-sm font-semibold text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-zinc-900">
                  View our cases
                </span>
              </a>
            </div>

            {/* Mobile Rings */}
            <div className="mt-16 flex justify-center md:hidden">
              <Rings3D />
            </div>
          </div>

          {/* Desktop Rings */}
          <div className="hidden items-center justify-center md:flex">
            <Rings3D />
          </div>
        </div>
        <GlassProofPanel />
      </section>

      {/* Full-screen contact overlay */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black">
          <ContactInterface onClose={() => setIsContactOpen(false)} isModal />
        </div>
      )}

      <section className="w-full">
        <div className="mx-auto mt-20 md:mt-28 max-w-6xl px-4 sm:px-6">
          <div className="relative mx-auto rounded-[28px] p-4 sm:p-6">
            <GlobeWidgetWrapper />
            <AgencyProcessSection />
          </div>
        </div>
      </section>
    </>
  );
}
// app/contact/page.tsx
"use client";  // Yeh rehne do (kyunkay state/refs yahan hain)

import React, { Suspense, useRef, useState } from "react";
import Navbar from "../components/landing/Navbar";
import ContactInterface from "../components/client/ContactInterface";

export default function ContactPage() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [navSolid, setNavSolid] = useState(true);

  const scrollTo = (target: string) => {
    if (typeof window !== "undefined") {
      const el = document.getElementById(target.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/${target.startsWith("#") ? target : "#" + target}`;
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar
        navSolid={navSolid}
        servicesOpen={servicesOpen}
        setServicesOpen={setServicesOpen}
        servicesBtnRef={servicesBtnRef}
        panelRef={panelRef}
        scrollTo={scrollTo}
        scrollProg={0}
      />

      {/* Suspense ko yahan broader bana do – pura dynamic part wrap */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-white/70">
          <p className="text-xl mb-4">Loading contact page...</p>
          {/* Optional skeleton for better UX */}
          <div className="w-3/4 h-64 bg-white/10 rounded-lg animate-pulse"></div>
        </div>
      }>
        <div className="pt-16 md:pt-0">
          <ContactInterface />
        </div>
      </Suspense>

      <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row">
          <span>© {new Date().getFullYear()} XOVATO. All rights reserved.</span>
          <span className="text-white/50">Built with XOVATO Tech with Love</span>
        </div>
      </footer>
    </div>
  );
}
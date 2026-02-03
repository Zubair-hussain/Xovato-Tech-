// lib/useSmoothScroll.ts   (or put directly in page.tsx)
"use client";

import { useCallback } from "react";

export function useSmoothScroll() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element #${id} not found`);
      return;
    }

    const navbarHeight = 64;           // your <nav className="h-16"> → 4rem = 64px
    const extraPadding = 24;           // breathing room (adjust to taste: 16–40px)
    const offset = navbarHeight + extraPadding;

    const yPosition =
      element.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top: yPosition,
      behavior: "smooth",
    });
  }, []);

  return scrollToSection;
}
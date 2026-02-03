// app/components/landing/GlobeWidgetWrapper.tsx
"use client";

import React, { useEffect, useState } from "react";
import GlobeReviewsWidget from "./GlobeReviewsWidget"; // Your Desktop File
import MobileGlobeReviews from "./MobileGlobeReviews"; // The New Mobile File

export default function GlobeWidgetWrapper() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // Check if width is less than standard tablet size (768px)
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return isMobile ? (
    <MobileGlobeReviews />
  ) : (
    <GlobeReviewsWidget />
  );
}
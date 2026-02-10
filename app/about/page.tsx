"use client";

import React, { useRef, useState, useEffect, Suspense } from "react"; // Suspense add kar diya
import AboutSection from "@/app/components/landing/About";
import Navbar from "@/app/components/landing/Navbar";

export default function AboutPage() {
    const [servicesOpen, setServicesOpen] = useState(false);
    const [navSolid, setNavSolid] = useState(true); // Always solid on inner pages usually, or scroll dependent

    const servicesBtnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close services dropdown on outside click / Esc
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

    // Simple stub for scrollTo since we might not have the same sections here
    // or we can just redirect to home with hash
    const scrollTo = (target: string) => {
        if (target.startsWith("#")) {
            // If it's a hash link, go to homepage with hash
            window.location.href = "/" + target;
        } else {
            // Services/About etc might be handled differently or just redirect
            // But for internal links like "services" string used in navbar:
            if (target === "services") return; // just open dropdown?
            if (target === "prices") window.location.href = "/#prices";
        }
    };

    return (
        <div className="bg-black min-h-screen text-white">
            <Navbar
                navSolid={navSolid}
                servicesOpen={servicesOpen}
                setServicesOpen={setServicesOpen}
                servicesBtnRef={servicesBtnRef}
                panelRef={panelRef}
                scrollTo={scrollTo}
                scrollProg={0}
            />
            <div className="pt-24">
                <Suspense fallback={<div className="text-white/70 text-center py-20">Loading About section...</div>}>
                    <AboutSection />
                </Suspense>
            </div>
        </div>
    );
}
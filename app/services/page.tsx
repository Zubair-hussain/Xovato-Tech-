"use client";

import React, { useRef, useState, Suspense } from "react"; // Suspense add kar diya
import Navbar from "../components/landing/Navbar";
import ServicesInteractive from "../components/landing/ServicesInteractive";

export default function ServicesPage() {
    const [servicesOpen, setServicesOpen] = useState(false);
    const servicesBtnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [navSolid, setNavSolid] = useState(true); // Always solid on subpages usually

    // Stub scrollTo for Navbar (since we are on a separate page)
    // If we want to support hompage links, we might need a more robust solution
    // but for now, the Navbar links mostly redirect to "/" anyway?
    // Checking Navbar code: internal links use scrollTo.
    // We can just redirect to home with hash if needed, similar to About page.
    const scrollTo = (target: string) => {
        if (typeof window !== "undefined") {
            window.location.href = `/${target.startsWith("#") ? target : "#" + target}`;
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
            />

            {/* Add padding for fixed navbar */}
            <div className="pt-24">
                <Suspense fallback={<div className="text-white/70 text-center py-20">Loading Services section...</div>}>
                    <ServicesInteractive />
                </Suspense>
            </div>
        </div>
    );
}
"use client";

import React, { useRef, useState, Suspense } from "react"; // Suspense add kar diya
import Navbar from "../components/landing/Navbar";
import WorkWithUs from "../components/client/WorkWithUsModal";

export default function WorkWithUsPage() {
    const [servicesOpen, setServicesOpen] = useState(false);
    const servicesBtnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [navSolid, setNavSolid] = useState(true);

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

            <div className="pt-16">
                <Suspense fallback={<div className="text-white/70 text-center py-20">Loading Work With Us section...</div>}>
                    <WorkWithUs />
                </Suspense>
            </div>

            <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row">
                    <span>© {new Date().getFullYear()} XOVATO. All rights reserved.</span>
                    <span className="text-white/50">Built with XOVATO Tech with Love</span>
                </div>
            </footer>
        </div>
    );
}
// app/components/landing/MobileGlobeReviews.tsx
"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import emailjs from "@emailjs/browser";
import { supabase } from "@/app/lib/supabaseClient";
import earthPeople from "./Earth-Data.json";

/* ──────────────────────────────────────────────── */
/* REUSED TYPES & HELPERS */
/* ──────────────────────────────────────────────── */
type ReviewRow = {
  id: string;
  country_code: string;
  category: string;
  rating: number;
  title: string | null;
  comment: string;
  status: "pending" | "approved" | "hidden" | "removed";
  created_at: string;
  display_name?: string | null;
  image?: string | null;
  reviewer_email?: string | null;
  email_verified?: boolean | null;
};

type Region = { label: string; countries: string[] };

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <span key={i} className={i < r ? "text-yellow-400" : "text-zinc-600"}>★</span>
      ))}
    </div>
  );
}

function initials(name?: string | null) {
  if (!name?.trim()) return "GU";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => (p?.[0] ? p[0].toUpperCase() : "")).join("");
}

/* ──────────────────────────────────────────────── */
/* DATA LOGIC */
/* ──────────────────────────────────────────────── */
const REGIONS: Region[] = [
  { label: "Asia", countries: ["PK", "IN", "BD", "JP", "SG"] },
  { label: "Middle East", countries: ["AE", "SA", "QA", "KW", "OM"] },
  { label: "Europe", countries: ["GB", "DE", "FR", "NL", "ES", "IT"] },
  { label: "North America", countries: ["US", "CA", "MX"] },
  { label: "Africa", countries: ["NG", "KE", "ZA", "EG", "MA"] },
  { label: "Oceania", countries: ["AU", "NZ"] },
];

function buildDemoReviews(countryCode: string): ReviewRow[] {
  return [
    { id: "1", country_code: countryCode, category: "App", rating: 5, title: "Great work", comment: "The design is amazing and very responsive.", status: "approved", created_at: new Date().toISOString(), display_name: "Mobile User" },
    { id: "2", country_code: countryCode, category: "Web", rating: 5, title: "Smooth animation", comment: "Love the auto-rotation feature on mobile.", status: "approved", created_at: new Date().toISOString(), display_name: "Fan" },
  ];
}

async function fetchApprovedReviews() {
  const { data } = await supabase.from("reviews").select("*").eq("status", "approved").limit(10);
  return (data && data.length > 0) ? (data as ReviewRow[]) : buildDemoReviews("PK");
}

/* ──────────────────────────────────────────────── */
/* 3D COMPONENTS */
/* ──────────────────────────────────────────────── */
const EARTH_TEX_URL = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";

function imageToImageData(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function makeEarthLandDotsFromTexture(imgData: ImageData) {
  const positions: number[] = [];
  const colors: number[] = [];
  const w = imgData.width; const h = imgData.height; const data = imgData.data;

  for (let i = 0; i < 2200; i++) {
    const u = Math.random(); const v = Math.random();
    const theta = 2 * Math.PI * u; const phi = Math.acos(2 * v - 1);
    const px = Math.floor(u * w); const py = Math.floor(v * h);
    const idx = (py * w + px) * 4;

    // Simple land check (not blue)
    if (data[idx + 2] < 100) {
      const r = 1.05;
      positions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      colors.push(0.7, 0.7, 0.75); // gray-ish
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geom;
}

function AutoRotatingGlobe({ onUpdateRegion }: { onUpdateRegion: (idx: number) => void }) {
  const ptsRef = useRef<THREE.Points>(null);
  const tex = useLoader(THREE.TextureLoader, EARTH_TEX_URL);

  const geom = useMemo(() => {
    const data = imageToImageData(tex.image);
    return data ? makeEarthLandDotsFromTexture(data) : new THREE.BufferGeometry();
  }, [tex]);

  const mat = useMemo(() => new THREE.PointsMaterial({ size: 0.025, vertexColors: true, transparent: true, opacity: 0.9 }), []);

  useFrame(({ clock }) => {
    if (!ptsRef.current) return;
    const t = clock.getElapsedTime();

    // ✅ Infinite Rotation (2 Dimensions: Y and X)
    ptsRef.current.rotation.y = t * 0.15; // Spin horizontally
    ptsRef.current.rotation.x = Math.sin(t * 0.3) * 0.2; // Tilt up/down slowly

    // Calculate Region based on rotation (0 to 1 cycle)
    const cycle = (t * 0.15) / (Math.PI * 2);
    const norm = cycle - Math.floor(cycle); // 0..1
    const regionIdx = Math.floor(norm * REGIONS.length);
    onUpdateRegion(regionIdx);
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
      <points ref={ptsRef} geometry={geom} material={mat} />
    </group>
  );
}

/* ──────────────────────────────────────────────── */
/* MAIN MOBILE COMPONENT */
/* ──────────────────────────────────────────────── */
export default function MobileGlobeReviews({ category = "Web App" }: { category?: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [regionIndex, setRegionIndex] = useState(0);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load Data
  useEffect(() => {
    (async () => {
      const data = await fetchApprovedReviews();
      setReviews(data);
      setLoading(false);
    })();
  }, []);

  // Handle Submit
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    // Basic Validation
    if (!name.trim() || !email.trim() || !comment.trim()) {
      setErrorMsg("All fields are required.");
      setSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Invalid email address.");
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          country_code: "PK", // Default or detect if possible, simplified for mobile speed
          category,
          rating,
          title: "Mobile Review",
          comment: comment.trim(),
          display_name: name.trim(),
          reviewer_email: email.trim(),
          status: "pending", // Default to pending moderation
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setName("");
        setEmail("");
        setComment("");
        setRating(5);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit. Check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get current active reviews based on region cycle
  // We use modulo to cycle through whatever data we have
  const topReview = reviews[regionIndex % reviews.length];
  const bottomReview = reviews[(regionIndex + 1) % reviews.length];

  return (
    <section className="relative w-full h-[100svh] bg-black overflow-hidden flex flex-col">

      {/* 1. 3D BACKGROUND (Z-0) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 2.6], fov: 60 }} gl={{ alpha: true }}>
          <ambientLight intensity={1} />
          <Suspense fallback={null}>
            <AutoRotatingGlobe onUpdateRegion={setRegionIndex} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2. UI LAYER (Z-10) */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none">

        {/* TOP REVIEW (Showing on Top of Object) */}
        <div className="w-full flex justify-center pt-8">
          <MobileReviewCard row={topReview} loading={loading} position="top" />
        </div>

        {/* CENTER BUTTONS (Showing on Center of Object) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-20">
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-full bg-emerald-600/90 border border-emerald-400/30 text-white font-bold shadow-xl backdrop-blur-md hover:scale-105 transition active:scale-95"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowPolicy(true)}
              className="px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-white/70 backdrop-blur-md"
            >
              View Policy
            </button>
          </div>
        </div>

        {/* BOTTOM REVIEW (Showing on Bottom of Object) */}
        <div className="w-full flex justify-center pb-8">
          <MobileReviewCard row={bottomReview} loading={loading} position="bottom" />
        </div>
      </div>

      {/* 3. MODALS (Form / Policy) */}
      {(showForm || showPolicy) && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          {showPolicy && (
            <div className="bg-zinc-900 w-full max-w-sm p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold text-lg mb-2">Privacy Policy</h3>
              <p className="text-white/60 text-sm mb-4">Reviews are subject to moderation to ensure quality and prevent spam. Your email is kept private and only used for verification.</p>
              <button onClick={() => setShowPolicy(false)} className="w-full py-3 bg-zinc-800 text-white rounded-xl">Close</button>
            </div>
          )}

          {showForm && (
            <div className="bg-zinc-900 w-full max-w-sm p-6 rounded-2xl border border-white/10">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-white font-bold text-xl">Review Submitted!</h3>
                  <p className="text-white/60 text-sm mt-2">Thank you for your feedback.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-bold text-lg mb-4">Write a Review</h3>

                  <div className="mb-4 flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-zinc-700'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your Name (Required)"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-3 text-sm focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email Address (Required)"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-3 text-sm focus:border-emerald-500 outline-none"
                  />
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Your experience... (Required)"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-3 text-sm focus:border-emerald-500 outline-none resize-none"
                    rows={3}
                  />

                  {errorMsg && <p className="text-red-400 text-xs mb-3 text-center">{errorMsg}</p>}

                  <div className="flex gap-2">
                    <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-zinc-800 text-white rounded-xl text-sm font-semibold">Cancel</button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Submit Review"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

    </section>
  );
}

function MobileReviewCard({ row, loading, position }: { row?: ReviewRow, loading: boolean, position: "top" | "bottom" }) {
  if (loading || !row) return <div className="w-64 h-24 bg-black/20 animate-pulse rounded-xl backdrop-blur-sm" />;

  return (
    <div className={`
            w-[90%] max-w-[320px] bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl 
            transition-all duration-700 animate-in fade-in slide-in-from-${position === 'top' ? 'top' : 'bottom'}-4
        `}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
          {initials(row.display_name)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white line-clamp-1">{row.title || "Review"}</h4>
          <Stars rating={row.rating} />
        </div>
      </div>
      <p className="text-xs text-white/80 line-clamp-2">{row.comment}</p>
    </div>
  );
}
// app/components/landing/GlobeReviewsWidget.tsx
"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import emailjs from "@emailjs/browser";
import { supabase } from "@/app/lib/supabaseClient";
import ShinyText from "./ShinyText";
import earthPeople from "./Earth-Data.json";

/* ──────────────────────────────────────────────── */
/* TYPES */
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

type EarthPerson = { name: string; country: string; image: string };

type Region = { label: string; countries: string[] };

/* ──────────────────────────────────────────────── */
/* HELPERS & UTILS */
/* ──────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <span key={i} className={i < r ? "text-yellow-400" : "text-zinc-600"}>
            ★
          </span>
        ))}
    </div>
  );
}

function initials(name?: string | null) {
  if (!name?.trim()) return "GU";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => (p?.[0] ? p[0].toUpperCase() : ""))
    .join("");
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function logAnyError(label: string, err: unknown) {
  // eslint-disable-next-line no-console
  console.error(label, err);
}

function logSupabaseError(error: any) {
  // eslint-disable-next-line no-console
  console.error("Supabase error:", error);
}

/* ──────────────────────────────────────────────── */
/* EMAILJS HELPERS */
/* ──────────────────────────────────────────────── */
async function sendEmailJSDirect(payload: {
  service_id: string;
  template_id: string;
  public_key: string;
  template_params: Record<string, any>;
}) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: payload.service_id,
      template_id: payload.template_id,
      user_id: payload.public_key,
      template_params: payload.template_params,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`EmailJS HTTP ${res.status}: ${text}`);
  return text;
}

/* ──────────────────────────────────────────────── */
/* HOOKS */
/* ──────────────────────────────────────────────── */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

const LS_KEYS = {
  experience: "globeReviews.experience",
  regionIndex: "globeReviews.regionIndex",
  progress: "globeReviews.progress",
  draft: "globeReviews.draft",
} as const;

/* ──────────────────────────────────────────────── */
/* TEXTURE & DOTS LOGIC */
/* ──────────────────────────────────────────────── */
const EARTH_TEX_URL = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";

function imageToImageData(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function latLonToUV(lat: number, lon: number) {
  return { u: (lon + 180) / 360, v: (90 - lat) / 180 };
}

function looksLikeLand(r: number, g: number, b: number) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const blueDom = bf - (rf + gf) * 0.5;
  const luminance = 0.2126 * rf + 0.7152 * gf + 0.0722 * bf;
  if (luminance > 0.92) return false;
  return blueDom < 0.06;
}

function makeEarthLandDotsFromTexture(imgData: ImageData, count = 2600, radius = 1.05) {
  const positions: number[] = [];
  const colors: number[] = [];
  const gray = new THREE.Color("#b9bec7");
  const blue = new THREE.Color("#4aa3ff");
  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  let tries = 0;
  const maxTries = count * 30;

  while (positions.length / 3 < count && tries < maxTries) {
    tries++;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const lat = 90 - (phi * 180) / Math.PI;
    const lon = (theta * 180) / Math.PI - 180;
    const uv = latLonToUV(lat, lon);
    const px = Math.min(w - 1, Math.max(0, Math.floor(uv.u * (w - 1))));
    const py = Math.min(h - 1, Math.max(0, Math.floor(uv.v * (h - 1))));
    const idx = (py * w + px) * 4;
    const rr = data[idx], gg = data[idx + 1], bb = data[idx + 2];

    if (!looksLikeLand(rr, gg, bb)) continue;

    const sinPhi = Math.sin(phi);
    positions.push(
      radius * sinPhi * Math.cos(theta),
      radius * Math.cos(phi),
      radius * sinPhi * Math.sin(theta)
    );

    const glint = Math.random() < 0.07;
    const c = glint ? blue.clone().lerp(gray, 0.25) : gray;
    colors.push(c.r, c.g, c.b);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geom.computeBoundingSphere();
  return geom;
}

/* ──────────────────────────────────────────────── */
/* REGIONS */
/* ──────────────────────────────────────────────── */
const REGIONS: Region[] = [
  { label: "Asia", countries: ["PK", "IN", "BD", "JP", "SG"] },
  { label: "Middle East", countries: ["AE", "SA", "QA", "KW", "OM"] },
  { label: "Europe", countries: ["GB", "DE", "FR", "NL", "ES", "IT"] },
  { label: "North America", countries: ["US", "CA", "MX"] },
  { label: "Africa", countries: ["NG", "KE", "ZA", "EG", "MA"] },
  { label: "Oceania", countries: ["AU", "NZ"] },
];

function getRegionIndexForCountry(code: string) {
  const c = (code || "").toUpperCase();
  const idx = REGIONS.findIndex((r) => r.countries.includes(c));
  return idx === -1 ? 0 : idx;
}

/* ──────────────────────────────────────────────── */
/* DEMO PEOPLE & REVIEWS */
/* ──────────────────────────────────────────────── */
function ccToCountryName(cc: string) {
  const map: Record<string, string> = {
    US: "United States", CA: "Canada", MX: "Mexico",
    FR: "France", DE: "Germany", NL: "Netherlands", GB: "United Kingdom",
    IN: "India", AU: "Australia", NZ: "New Zealand",
    PK: "Pakistan", AE: "United Arab Emirates", SA: "Saudi Arabia",
  };
  return map[cc] ?? "Pakistan";
}

function pickDemoPeopleForCountry(countryCode: string, count: number) {
  const target = ccToCountryName(countryCode);
  const all = earthPeople as EarthPerson[];
  const list = all.filter((p) => p.country === target);
  const pool = list.length ? list : all;
  const picked: EarthPerson[] = [];
  const used = new Set<number>();

  for (let t = 0; t < 100 && picked.length < count; t++) {
    const idx = Math.floor(Math.random() * pool.length);
    if (used.has(idx)) continue;
    used.add(idx);
    picked.push(pool[idx]);
  }
  return picked;
}

function buildDemoReviews(countryCode: string, category: string): ReviewRow[] {
  const people = pickDemoPeopleForCountry(countryCode, 4);
  const templates = [
    { title: "Premium UI & smooth flow", comment: "Animations feel clean and modern. The layout is fast, responsive, and the overall experience feels premium.", rating: 5 },
    { title: "Super professional delivery", comment: "Communication was clear, changes were handled quickly, and the final result looked exactly as expected.", rating: 5 },
    { title: "Solid work & great support", comment: "A couple of tweaks were needed, but everything was fixed fast and the project was delivered on time.", rating: 4 },
    { title: "Highly recommended", comment: "Design is modern, performance is strong, and the attention to detail is excellent. Would work again.", rating: 5 },
  ];

  return templates.map((t, i) => ({
    id: `demo-${countryCode}-${i}`,
    country_code: countryCode,
    category,
    rating: t.rating,
    title: t.title,
    comment: t.comment,
    status: "approved",
    created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    display_name: people[i]?.name ?? "Guest User",
    image: people[i]?.image ?? null,
    email_verified: true,
  }));
}

async function fetchApprovedReviews(countryCode?: string, category?: string) {
  let q = supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (countryCode) q = q.eq("country_code", countryCode);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

async function detectUserCountry() {
  try {
    const res = await fetch("/api/geo", { cache: "no-store" });
    if (!res.ok) return "PK";
    const json = await res.json().catch(() => null);
    return json?.country_code || "PK";
  } catch {
    return "PK";
  }
}

/* ──────────────────────────────────────────────── */
/* 3D SCENE: GLOBE */
/* ──────────────────────────────────────────────── */
function GlobeBase() {
  return (
    <mesh>
      <sphereGeometry args={[1.02, 48, 48]} />
      <meshStandardMaterial
        color={"#05080f"}
        emissive={"#03060b"}
        emissiveIntensity={0.4}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function GlobeDots({
  experienceProgressRef,
  manualYawRef,
  manualPitchRef,
  active,
}: {
  experienceProgressRef: React.MutableRefObject<number>;
  manualYawRef: React.MutableRefObject<number>;
  manualPitchRef: React.MutableRefObject<number>;
  active: boolean;
}) {
  const ptsRef = useRef<THREE.Points>(null);

  const tex = useLoader(THREE.TextureLoader, EARTH_TEX_URL, (loader) => {
    loader.crossOrigin = "anonymous";
  });

  const geom = useMemo(() => {
    const img = tex?.image as HTMLImageElement | undefined;
    if (!img || typeof document === "undefined") return new THREE.BufferGeometry();
    const data = imageToImageData(img);
    if (!data) return new THREE.BufferGeometry();
    return makeEarthLandDotsFromTexture(data, 2800, 1.06);
  }, [tex]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.024,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    []
  );

  const ASIA_YAW = useMemo(() => -((100 * Math.PI) / 180), []);

  useFrame(() => {
    if (!ptsRef.current) return;
    const p = experienceProgressRef.current; // 0 to 1

    // 1. Yaw (Left/Right rotation):
    // Base offset + Scroll progress spinning + Manual Drag
    const yawBase = ASIA_YAW + p * Math.PI * 2.35;
    const targetYaw = yawBase + manualYawRef.current;

    // 2. Pitch (Up/Down rotation):
    // Base tilt + Sine wave based on scroll (p) + Manual Drag
    const pitchBase = (12 * Math.PI) / 180;
    const pitchScrollEffect = Math.sin(p * Math.PI) * 0.4;
    const targetPitch = pitchBase + pitchScrollEffect + manualPitchRef.current;

    ptsRef.current.rotation.y = targetYaw;
    ptsRef.current.rotation.x = targetPitch;

    // Breathing scale effect
    const s = 1 + Math.sin(Date.now() * 0.001) * 0.006;
    ptsRef.current.scale.setScalar(s);
  });

  return (
    <points ref={ptsRef} geometry={geom} material={mat} />
  );
}

/* ──────────────────────────────────────────────── */
/* MAIN WIDGET */
/* ──────────────────────────────────────────────── */
export default function GlobeReviewsWidget({ category = "Web App" }: { category?: string }) {
  // State
  const [experience, setExperience] = useState(false);
  const progressRef = useRef(0);
  const [progressUI, setProgressUI] = useState(0);

  // Interaction State (Manual Drag)
  const manualYawRef = useRef(0);
  const manualPitchRef = useRef(0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const { ref: canvasWrapRef, w, h } = useElementSize<HTMLDivElement>();
  const canRenderCanvas = w > 40 && h > 40;

  // Viewport Culling
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    if (canvasWrapRef.current) observer.observe(canvasWrapRef.current);
    return () => observer.disconnect();
  }, [canvasWrapRef]);

  const [regionIndex, setRegionIndex] = useState(0);
  const currentRegion = REGIONS[regionIndex % REGIONS.length];

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState<string>("PK");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");


  /* --- Restore LS & Init --- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRegion = localStorage.getItem(LS_KEYS.regionIndex);
    const savedProgress = localStorage.getItem(LS_KEYS.progress);
    if (savedRegion) setRegionIndex(Number(savedRegion) || 0);
    if (savedProgress) {
      const p = clamp01(Number(savedProgress) || 0);
      progressRef.current = p;
      setProgressUI(p);
    }
    // Draft restore
    const draft = localStorage.getItem(LS_KEYS.draft);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setDisplayName(d.displayName ?? "");
        setReviewerEmail(d.reviewerEmail ?? "");
        setTitle(d.title ?? "");
        setComment(d.comment ?? "");
        setRating(Number(d.rating ?? 5));
      } catch { }
    }
  }, []);

  /* * ✅ FIX: REMOVE progressUI from this effect 
   * Saving to localStorage 60 times a second causes performance lag and update depth errors.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEYS.regionIndex, String(regionIndex));
    // We do NOT save progressUI here continuously anymore to prevent lag
  }, [regionIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEYS.draft, JSON.stringify({ displayName, reviewerEmail, title, comment, rating }));
  }, [displayName, reviewerEmail, title, comment, rating]);

  useEffect(() => {
    const pub = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (pub) emailjs.init({ publicKey: pub });
  }, []);

  /* --- Detect Country --- */
  useEffect(() => {
    (async () => {
      const cc = await detectUserCountry();
      setUserCountry(cc);
      const idx = getRegionIndexForCountry(cc);
      setRegionIndex(idx);
      // init progress if empty
      setProgressUI((p) => {
        if (p > 0) return p;
        const base = idx / REGIONS.length;
        progressRef.current = base;
        return base;
      });
    })();
  }, []);

  /* --- Scroll Lock --- */
  const shouldLockScroll = experience || showForm || showPolicy;
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    if (shouldLockScroll) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.style.overflow = prevHtml || "";
      body.style.overflow = prevBody || "";
    }
    return () => {
      html.style.overflow = prevHtml || "";
      body.style.overflow = prevBody || "";
    };
  }, [shouldLockScroll]);

  /* * ✅ FIXED SCROLL & MOMENTUM LOGIC 
   * Prevents "Maximum update depth exceeded" by only updating state when necessary
   */
  useEffect(() => {
    if (!experience) return;
    if (showForm || showPolicy) return;

    const el = overlayRef.current;
    if (!el) return;

    let velocity = 0;
    let raf = 0;

    const tick = () => {
      // 1. Calculate physics
      const next = clamp01(progressRef.current + velocity);
      progressRef.current = next;
      velocity *= 0.93; // Friction

      // 2. Safe UI Update (Lerp)
      // ✅ Optimization: Check if state actually needs an update to prevent loop
      setProgressUI((prev) => {
        const target = prev * 0.88 + next * 0.12;
        // If difference is tiny, stop updating to break the render cycle
        if (Math.abs(target - prev) < 0.0001) return prev;
        return target;
      });

      // 3. Safe Region Update
      const rawIdx = Math.floor(next * REGIONS.length);
      const newRegionIdx = Math.min(REGIONS.length - 1, Math.max(0, rawIdx));

      // ✅ Optimization: Only set state if the integer index actually changed
      setRegionIndex((prev) => (prev !== newRegionIdx ? newRegionIdx : prev));

      // 4. Continue Loop only if moving
      if (Math.abs(velocity) > 0.00005) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocity += e.deltaY * 0.00009;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel as any);
      cancelAnimationFrame(raf);
    };
  }, [experience, showForm, showPolicy]);

  /* --- Pointer/Drag Logic --- */
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!experience || showForm || showPolicy) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    manualYawRef.current += dx * 0.005;
    manualPitchRef.current += dy * 0.005;
    manualPitchRef.current = Math.max(-1.0, Math.min(1.0, manualPitchRef.current));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  /* --- Fetch Reviews --- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const country = currentRegion.countries.includes(userCountry)
          ? userCountry
          : currentRegion.countries[0];
        const data = await fetchApprovedReviews(country, category);
        const finalRows = data.length > 0 ? data : buildDemoReviews(country, category);
        if (mounted) setReviews(finalRows);
      } catch (err) {
        logAnyError("fetchReviews", err);
        const country = currentRegion.countries.includes(userCountry)
          ? userCountry
          : currentRegion.countries[0];
        if (mounted) setReviews(buildDemoReviews(country, category));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [regionIndex, category, userCountry, currentRegion]);

  /* --- Cards Visibility Logic --- */
  const cards = [
    { row: reviews[0], visible: progressUI > 0.14 },
    { row: reviews[1], visible: progressUI > 0.34 },
    { row: reviews[2], visible: progressUI > 0.56 },
    { row: reviews[3], visible: progressUI > 0.78 },
  ];



  /* --- Submit Logic --- */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSuccess(false);

    const cleanTitle = title.trim();
    const cleanComment = comment.trim();
    const cleanName = displayName.trim();
    const cleanEmail = reviewerEmail.trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(cleanEmail);

    if (!cleanName || !cleanTitle || !cleanComment || !cleanEmail) {
      setErrorMsg("Please fill in all fields.");
      setSubmitting(false);
      return;
    }
    if (!emailOk) {
      setErrorMsg("Invalid email.");
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from("reviews").insert([{
        country_code: userCountry,
        category,
        rating,
        title: cleanTitle,
        comment: cleanComment,
        display_name: cleanName,
        reviewer_email: cleanEmail,
      }]);

      if (error) {
        logSupabaseError(error);
        throw error;
      }

      setSuccess(true);
      setTitle(""); setComment(""); setDisplayName(""); setReviewerEmail(""); setRating(5);
      setTimeout(() => setShowForm(false), 1800);

      // EmailJS
      const SERVICE = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const TO_EMAIL = process.env.NEXT_PUBLIC_REVIEW_NOTIFY_EMAIL;
      const PUB = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (SERVICE && TEMPLATE && TO_EMAIL && PUB) {
        const params = {
          to_email: TO_EMAIL,
          display_name: cleanName,
          reviewer_email: cleanEmail,
          title: cleanTitle,
          comment: cleanComment,
          rating: String(rating),
          country_code: userCountry,
          category,
        };
        try {
          await emailjs.send(SERVICE, TEMPLATE, params);
        } catch (err) {
          await sendEmailJSDirect({
            service_id: SERVICE, template_id: TEMPLATE, public_key: PUB, template_params: params
          }).catch(() => { });
        }
      }
    } catch (err) {
      logAnyError("Submit failed", err);
      setErrorMsg("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cornerPositions = [
    "top-16 md:top-20 left-4 md:left-12",
    "top-16 md:top-20 right-4 md:right-12",
    "bottom-32 left-4 md:left-12",
    "bottom-32 right-4 md:right-12",
  ];

  /* --- Render --- */
  return (
    <section className={`w-full bg-black transition-all duration-500 ${experience ? "fixed inset-0 z-[9990] h-[100svh]" : "relative"}`}>
      <div className={`relative w-full bg-black ${experience ? "h-full" : "h-[420px] sm:h-[640px] lg:h-[720px]"}`}>

        {/* Globe Layer (Z=0) */}
        <div className={`absolute inset-0 z-0 flex items-center justify-center bg-black transition-all duration-300 ${showForm ? "blur-sm opacity-60" : "opacity-100"}`}>
          <div ref={canvasWrapRef} className="relative w-[200px] h-[200px] sm:w-[420px] sm:h-[420px] lg:w-[600px] lg:h-[600px]">
            {canRenderCanvas ? (
              <Canvas
                dpr={[1, 1.75]}
                camera={{ position: [0, 0, 2.85], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ width: "100%", height: "100%", pointerEvents: "none" }} // Pass clicks to Overlay
                frameloop={isVisible ? "always" : "never"}
              >
                <ambientLight intensity={0.75} />
                <directionalLight position={[5, 4, 5]} intensity={1.4} />
                <Environment preset="city" />
                <Suspense fallback={null}>
                  <GlobeBase />
                  <GlobeDots
                    experienceProgressRef={progressRef}
                    manualYawRef={manualYawRef}
                    manualPitchRef={manualPitchRef}
                    active={experience}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="w-full h-full rounded-full bg-[#05080f]" />
            )}
          </div>
        </div>

        {/* Landing UI (Z=10) */}
        {!experience && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Global Client Feedback</h2>
            <p className="text-white/60 mb-6 max-w-lg">Click start, then scroll to explore reviews from around the world.</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-sm text-white/80 mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
              {currentRegion.label}
            </div>
            <button
              onClick={() => {
                setExperience(true);
                // Reset animation state
                const base = regionIndex / REGIONS.length;
                progressRef.current = base;
                setProgressUI(base);
                manualYawRef.current = 0;
                manualPitchRef.current = 0;
              }}
              className="group relative inline-flex h-12 overflow-hidden rounded-full p-[2px]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#10b981_50%,#000000_100%)]" />
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-8 text-sm font-bold text-white backdrop-blur-3xl group-hover:bg-zinc-900 transition">
                <ShinyText text="Start Experience" speedMs={1400} />
              </span>
            </button>
          </div>
        )}

        {/* Experience Overlay (Z=30) - Handles Scroll & Drag */}
        {experience && (
          <div
            ref={overlayRef}
            className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing bg-transparent"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-40">
              <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur text-xs text-white/70 border border-white/10">
                SCROLL or DRAG TO EXPLORE
              </div>
              <button
                type="button"
                onClick={() => setExperience(false)}
                className="pointer-events-auto px-4 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-xs text-white border border-white/10 transition"
              >
                Exit
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 md:bottom-10 left-0 w-full flex justify-center items-center gap-4 z-40 pointer-events-auto">
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/40 transition-transform hover:scale-105"
              >
                Submit Review
              </button>
              <button onClick={() => setShowPolicy(true)} className="text-white/60 hover:text-white text-sm underline">
                Policy
              </button>
            </div>

            {/* Desktop Reviews */}
            <div className="hidden sm:block pointer-events-none z-30">
              {cards.map(({ row, visible }, i) => (
                <div key={i} className={`absolute ${cornerPositions[i]} w-[300px]`}>
                  <PopupReviewCard row={row} loading={loading} visible={visible} />
                </div>
              ))}
            </div>


          </div>
        )}

        {/* Modal Backdrop (Z=40) */}
        {(showPolicy || showForm) && <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm" />}

        {/* Policy Modal */}
        {showPolicy && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Privacy Policy</h3>
              <p className="text-white/70 text-sm mb-4">Reviews are public. No spam allowed.</p>
              <button onClick={() => setShowPolicy(false)} className="w-full py-3 bg-black rounded-xl text-white font-medium hover:bg-zinc-800">Close</button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-lg font-bold text-white">Submit Review</h3>
                <button onClick={() => setShowForm(false)} className="text-white/60 hover:text-white">✕</button>
              </div>

              <div className="p-6 overflow-y-auto text-white">
                {success ? (
                  <div className="text-center py-10">
                    <div className="text-4xl text-emerald-500 mb-4">✓</div>
                    <h4 className="text-xl font-bold">Received!</h4>
                    <p className="text-white/50 text-sm mt-2">Pending approval.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {errorMsg && <div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-lg">{errorMsg}</div>}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/50">Name</label>
                        <input className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none"
                          required value={displayName} onChange={e => setDisplayName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/50">Email</label>
                        <input className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none"
                          required type="email" value={reviewerEmail} onChange={e => setReviewerEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-white/50">Title</label>
                      <input className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none"
                        required value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-white/50">Review</label>
                      <textarea className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none resize-none"
                        rows={3} required value={comment} onChange={e => setComment(e.target.value)} />
                    </div>

                    <div className="p-3 bg-zinc-900/50 rounded-xl flex items-center justify-between">
                      <span className="text-sm font-medium">Rating</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" onClick={() => setRating(n)} className={`text-xl ${n <= rating ? "text-yellow-400" : "text-zinc-700"}`}>★</button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-zinc-900 text-sm text-white/70">Cancel</button>
                      <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-emerald-600 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
                        {submitting ? "Sending..." : "Submit"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────── */
/* POPUP CARD COMPONENT */
/* ──────────────────────────────────────────────── */
function PopupReviewCard({
  row,
  loading,
  visible,
  compact = false,
  interactive = false,
}: {
  row?: ReviewRow;
  loading: boolean;
  visible: boolean;
  compact?: boolean;
  interactive?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const anim = visible
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 translate-y-8 scale-95 pointer-events-none";

  const shell = compact
    ? "rounded-xl bg-black/85 backdrop-blur-xl p-4 shadow-2xl border border-white/10"
    : "rounded-2xl bg-black/80 backdrop-blur-xl p-5 shadow-2xl border border-white/10";

  if (loading) {
    return (
      <div className={`transition-all duration-700 ease-out transform ${anim}`}>
        <div className={shell}>
          <div className="h-4 w-24 bg-zinc-800 rounded mb-2 animate-pulse" />
          <div className="h-2 w-full bg-zinc-800 rounded mb-1 animate-pulse" />
          <div className="h-2 w-2/3 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!row) {
    return (
      <div className={`transition-all duration-700 ease-out transform ${anim}`}>
        <div className={`${shell} text-white/50 text-xs`}>No reviews yet.</div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-700 ease-out transform ${anim}`}>
      <div className={shell}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.image} alt="" className="h-9 w-9 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                {initials(row.display_name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{row.title}</p>
              <p className="text-xs text-white/50 truncate">{row.country_code} · {row.category}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <Stars rating={row.rating} />
            <p className="text-[10px] text-white/40 mt-1">{new Date(row.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-1">
          <p
            className={`text-xs text-white/80 leading-relaxed ${!expanded && compact ? "line-clamp-3" : ""}`}
          >
            {row.comment}
          </p>
          {compact && interactive && row.comment.length > 100 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-[10px] text-white/50 mt-1 hover:text-white underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          Verified Client
        </div>
      </div>
    </div>
  );
}
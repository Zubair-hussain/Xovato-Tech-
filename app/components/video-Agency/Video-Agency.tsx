'use client';

import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight, Play, CheckCircle2,
  Zap, Heart, TrendingUp, X,
  Layers, MonitorPlay,
  Flame, Award, Globe, Video,
  Calendar, ChevronDown, BarChart3,
  Scissors, Activity, FileVideo, Clock,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Syne, Geist_Mono } from 'next/font/google';
import Navbar from '../landing/Navbar';
import { ReactLenis, useLenis } from 'lenis/react';

// Note: Replace these imports if your project structure is different
import { cn } from "@/app/lib/cn";
import { supabase } from "@/app/lib/supabaseClient";

const syne = Syne({ subsets: ['latin'] });
const mono = Geist_Mono({ subsets: ['latin'] });

// --- INTERFACES ---
interface Theme {
  bg: string;
  cardBg: string;
  accent: string;
  border: string;
}

interface ServiceOptions {
  [key: string]: string[];
}

interface CurrencyConfig {
  code: string;
  rate: number;
  locale: string;
}

interface MarqueePerson {
  name: string;
  color: string;
}

interface VideoData {
  id: number;
  title: string;
  client: string;
  views: string;
  sticker: string;
}

interface SpotlightGridProps {
  children: React.ReactNode;
}

interface TiltCardProps {
  children: React.ReactNode;
}

interface StickerProps {
  children: React.ReactNode;
  rotate?: string;
  className?: string;
  delay?: number;
  float?: boolean;
}

// --- HELPER COMPONENTS ---

const Sticker = React.memo(({ children, rotate = "0deg", className, delay = 0, float = false }: StickerProps) => {
  const animation = float
    ? { y: [0, -10, 0], rotate: [parseInt(rotate), parseInt(rotate) + 5, parseInt(rotate)] }
    : {};
  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      whileInView={{ scale: 1, rotate: rotate }}
      animate={float ? animation : {}}
      transition={float
        ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
        : { type: "spring", bounce: 0.5, delay }
      }
      className={`absolute z-30 flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black font-black text-[10px] md:text-xs uppercase text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] pointer-events-none select-none ${className}`}
    >
      {children}
    </motion.div>
  );
});
Sticker.displayName = "Sticker";

const MarqueeItem = React.memo(({ p }: { p: MarqueePerson }) => (
  <div className="flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/5 rounded-full whitespace-nowrap mx-2 min-w-[200px]">
    <div className={`w-2 h-2 rounded-full ${p.color} shadow-[0_0_12px_currentColor]`} />
    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">{p.name}</span>
  </div>
));
MarqueeItem.displayName = "MarqueeItem";

interface ContactFormContentProps {
  onClose: () => void;
}

// --- THEME ---
const THEME: Theme = {
  bg: "bg-[#050505]",
  cardBg: "bg-[#0A0A0A]",
  accent: "text-emerald-500",
  border: "border-white/5"
};

// ─── CONTACT FORM CONSTANTS ──────────────────────────────────────────────────
const SERVICE_OPTIONS: ServiceOptions = {
  "Video Editing": ["Commercial Ad", "YouTube Content", "Social Reels", "Corporate", "Documentary"],
  "Website Development": ["E-Commerce", "Sa'aS Platform", "Landing Page", "Portfolio", "Dashboard"],
  "Mobile Application": ["iOS (Swift)", "Android (Kotlin)", "React Native", "Flutter", "Tablet App"],
  "SEO & Insights": ["Technical Audit", "Content Strategy", "Backlink Campaign", "Local SEO", "Analytics Setup"],
  "AI / ML Models": ["Chatbot / Agent", "Data Prediction", "Image Recognition", "Automation", "NLP Model"],
};

const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  PK: { code: "PKR", rate: 278.5, locale: "ur-PK" },
  IN: { code: "INR", rate: 83.5, locale: "en-IN" },
  US: { code: "USD", rate: 1, locale: "en-US" },
  AE: { code: "AED", rate: 3.67, locale: "ar-AE" },
  GB: { code: "GBP", rate: 0.79, locale: "en-GB" },
  EU: { code: "EUR", rate: 0.92, locale: "de-DE" },
};

// ─── DATA ──────────────────────────────────────────────────
const ROW_1: MarqueePerson[] = [
  { name: "Zeel Jain", color: "bg-blue-500" }, { name: "Liah Yoo", color: "bg-purple-500" },
  { name: "Andrew Sorkin", color: "bg-orange-500" }, { name: "Chris Goode", color: "bg-emerald-500" },
  { name: "Tristan B.", color: "bg-pink-500" }, { name: "Saksham G.", color: "bg-cyan-500" },
  { name: "Krave Beauty", color: "bg-yellow-500" }, { name: "SpaceGod", color: "bg-red-500" }
];

const ROW_2: MarqueePerson[] = [
  { name: "Vortex", color: "bg-indigo-500" }, { name: "Elevate", color: "bg-lime-500" },
  { name: "NexGen", color: "bg-teal-500" }, { name: "Flux", color: "bg-rose-500" },
  { name: "Orbit", color: "bg-violet-500" }, { name: "Pulse", color: "bg-amber-500" },
  { name: "Momentum", color: "bg-fuchsia-500" }, { name: "Apex", color: "bg-sky-500" }
];

const VIDEOS: VideoData[] = [
  { id: 1, title: "Viral Launch", client: "Alex Hormozi Style", views: "1.2M", sticker: "HOT" },
  { id: 2, title: "Docu-Series", client: "Iman Gadzhi Style", views: "850K", sticker: "EPIC" },
  { id: 3, title: "Product Reveal", client: "Tech Crunch", views: "2.1M", sticker: "NEW" },
  { id: 4, title: "Lifestyle Vlog", client: "Sam Sulek Style", views: "500K", sticker: "RAW" },
  { id: 5, title: "Podcast Clip", client: "Diary of CEO", views: "3.4M", sticker: "VIRAL" },
];

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

function SpotlightGrid({ children }: SpotlightGridProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div className="group relative w-full h-full overflow-hidden bg-black/90 p-4 flex items-center justify-center" onMouseMove={handleMouseMove}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(16,185,129,0.15), transparent 80%)` }}
      />
      {children}
    </div>
  );
}

function TiltCard({ children }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleLeave = () => { x.set(0); y.set(0); };
  const rotateX = useMotionTemplate`${y} * -5deg`;
  const rotateY = useMotionTemplate`${x} * 5deg`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
      className="relative z-20 w-full max-w-5xl rounded-[32px] transition-all duration-200 ease-out"
    >
      {children}
    </motion.div>
  );
}


// ─── HERO BACKGROUND ANIMATION (Fixed: Deterministic Values) ────────────────
const TimelineBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 select-none">
    {/* Animated Tracks Moving Left */}
    <motion.div
      className="absolute top-[20%] left-0 right-0 space-y-4 will-change-transform"
      animate={{ x: ["-10%", "-20%"] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      {/* Track 1: Video Blocks (Reduced count) */}
      <div className="flex gap-2">
        {[...Array(10)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="h-16 rounded-lg bg-white/5 border border-white/10 relative overflow-hidden"
            // FIX: Replaced Math.random() with deterministic math based on index 'i'
            style={{ width: ((i * 37) % 150) + 80 }}
          >
            {/* Thumbnail simulation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-gray-500">C00{i}_RAW.mp4</div>
          </div>
        ))}
      </div>

      {/* Track 2: Audio Waveform (Reduced count) */}
      <div className="flex gap-1 mt-4">
        {[...Array(15)].map((_, i) => (
          <div key={`a-${i}`} className="h-12 w-32 bg-emerald-900/20 border border-emerald-500/20 rounded-md flex items-center justify-center overflow-hidden">
            <div className="flex items-center gap-[2px] h-full">
              {[...Array(5)].map((_, j) => (
                <motion.div
                  key={j}
                  className="w-1 bg-emerald-500/40 rounded-full"
                  animate={{ height: ["20%", "80%", "40%"] }}
                  // FIX: Replaced Math.random() with deterministic math based on 'i' and 'j'
                  transition={{ duration: 0.5, repeat: Infinity, delay: ((i + j) * 0.1) % 1 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* The Retention Graph Overlay */}
    <svg className="absolute top-[30%] left-0 w-full h-64 opacity-20" viewBox="0 0 1000 200" preserveAspectRatio="none">
      <motion.path
        d="M0,150 Q100,150 150,100 T300,50 T450,120 T600,30 T800,100 T1000,80"
        fill="none"
        stroke="#10B981"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
      <motion.path
        d="M0,150 Q100,150 150,100 T300,50 T450,120 T600,30 T800,100 T1000,80 V200 H0 Z"
        fill="url(#heroGradient)"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="heroGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>

    {/* Playhead (Vertical Red Line) */}
    <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-red-500 z-10 shadow-[0_0_15px_red]">
      <div className="absolute top-20 -translate-x-1/2 bg-red-500 text-black text-[9px] font-bold px-1 rounded-sm">00:00:14:22</div>
    </div>
  </div>
);

function ContactFormContent({ onClose }: ContactFormContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router here if needed, but not used in props currently
  const [service, setService] = useState<string>("Video Editing");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [predictedCost, setPredictedCost] = useState<number>(0);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig>(CURRENCY_MAP["US"]);
  const [formattedMarket, setFormattedMarket] = useState<string>("$0");
  const [formattedXovato, setFormattedXovato] = useState<string>("$0");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    const s = searchParams?.get("interest");
    if (s && SERVICE_OPTIONS[s] && s !== service) {
      setService(s);
      setSelectedTypes([]);
      setPredictedCost(0);
      setStep(1);
    }
  }, [searchParams, service]);

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let region = "US";
    if (timeZone.includes("Karachi")) region = "PK";
    else if (timeZone.includes("Calcutta")) region = "IN";
    else if (timeZone.includes("Dubai")) region = "AE";
    else if (timeZone.includes("London")) region = "GB";
    else if (timeZone.includes("Berlin")) region = "EU";
    setCurrencyConfig(CURRENCY_MAP[region] || CURRENCY_MAP["US"]);
  }, []);

  const calculatedValuation = useMemo(() => {
    const total = predictedCost * currencyConfig.rate;
    const xovato = total * 0.75;
    const fmt = new Intl.NumberFormat(currencyConfig.locale, {
      style: "currency",
      currency: currencyConfig.code,
      maximumFractionDigits: 0,
    });
    return {
      market: fmt.format(total),
      xovato: fmt.format(xovato)
    };
  }, [predictedCost, currencyConfig]);

  useEffect(() => {
    if (selectedTypes.length === 0) {
      if (predictedCost !== 0) setPredictedCost(0);
      return;
    }
    setIsAiThinking(true);
    const timer = setTimeout(() => {
      setPredictedCost(selectedTypes.length * 500 + 200);
      setIsAiThinking(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedTypes, predictedCost]);

  const toggleType = (t: string) => setSelectedTypes((p) => (p.includes(t) ? p.filter((i) => i !== t) : [...p, t]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("project_inquiries").insert([
        {
          source_id: service,
          project_types: selectedTypes,
          ai_estimated_cost_usd: predictedCost,
          client_currency: currencyConfig.code,
          client_name: name,
          client_email: email,
          details,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);
      setStatus(error ? "error" : "success");
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
    }
    setLoading(false);
  };

  if (status === "success") {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-5xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">🚀</div>
        <h2 className="mb-2 text-3xl font-bold text-white">Signal Received</h2>
        <p className="text-white/60 mb-6 text-sm">Your project inquiry has been securely transmitted.</p>
        <button onClick={onClose} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg hover:bg-emerald-400 transition-all">
          <CheckCircle2 size={16} /> Close & Continue
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-7 p-6 sm:p-10 relative z-20">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 rounded-full bg-emerald-950/50 border border-emerald-500/20 px-3 py-1">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">Secure Link</span>
            </motion.div>
            <div className="relative group">
              <select value={service} onChange={(e) => { setService(e.target.value); setSelectedTypes([]); setStep(1); }} className="appearance-none bg-zinc-900/80 border border-white/10 text-white text-[11px] font-medium uppercase tracking-wide rounded-full pl-4 pr-8 py-1.5 outline-none focus:border-emerald-500/50 hover:bg-zinc-800 transition-all cursor-pointer">
                {Object.keys(SERVICE_OPTIONS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">Initiate <span className="text-emerald-500">{service.split(" ")[0]}</span> Protocol</h1>
          <p className="text-white/50 text-sm">Configure parameters. AI analysis active.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 block">Select Modules</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICE_OPTIONS[service]?.map((opt) => (
                      <div key={opt} onClick={() => toggleType(opt)} className={cn("cursor-pointer relative overflow-hidden rounded-lg border px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 group", selectedTypes.includes(opt) ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/5 bg-white/5 text-white/50 hover:border-emerald-500/30 hover:text-white")}>
                        <span className="relative z-10">{opt}</span>
                        {selectedTypes.includes(opt) && <motion.div layoutId="highlight" className="absolute inset-0 bg-emerald-500/10 z-0" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => setStep(2)} disabled={selectedTypes.length === 0} className="group relative overflow-hidden rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-all hover:scale-105 disabled:opacity-50">
                    <span className="relative z-10 flex items-center gap-2">Proceed <span className="text-sm">→</span></span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5"><label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Identity</label><input name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Comms</label><input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none" /></div>
                </div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Brief</label><textarea name="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Objective..." className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none resize-none" /></div>
                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">← Back</button>
                  <button type="submit" disabled={loading || !name || !email} className="group relative overflow-hidden rounded-full bg-emerald-500 px-8 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50">{loading ? "Sending..." : "Execute Protocol"}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
      <div className="lg:col-span-5 relative bg-zinc-900/50 border-l border-white/10 p-6 sm:p-10 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"><div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" /></div>
        <div className="relative z-10 space-y-8">
          <div><h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Market Analysis</h3><div className="flex items-end gap-2"><span className="text-3xl font-mono font-bold text-white tracking-tighter">{isAiThinking ? <span className="animate-pulse text-emerald-500 text-xl">SCANNING...</span> : calculatedValuation.market}</span>{!isAiThinking && <span className="text-xs text-white/40 mb-1">Avg.</span>}</div></div>
          <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 to-transparent" />
          <div><h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Xovato Optimized</h3><div className="flex items-end gap-2"><span className="text-5xl font-mono font-black text-emerald-400 tracking-tighter">{isAiThinking ? <span className="opacity-50 text-3xl">---</span> : calculatedValuation.xovato}</span></div><div className="mt-2 inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400 border border-emerald-500/20"><span>Valuation Optimized</span></div></div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ────────────────────────────────────────────────────
// ─── MAIN PAGE COMPONENT ────────────────────────────────────────────────────
export default function XovatoMetroPremium() {
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Navbar State
  const [servicesOpen, setServicesOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const servicesBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- DRAG TO SCROLL LOGIC ---
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollResult = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Approx card width
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Sync Lenis with GSAP
  useLenis((lenis) => {
    ScrollTrigger.update();
    setNavSolid(lenis.scroll > 18);
  });

  // Mobile Detection for Performance
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollTo = (target: string) => {
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(target, { offset: -88, duration: 1.5 });
    } else {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 🔴 IMPORTANT: PASTE YOUR CLOUDINARY LINK HERE DIRECTLY (Inside the quotes)
  const videoUrl = "https://res.cloudinary.com/dngzhdxfe/video/upload/Into-Xovato_jpzvz4.mp4";

  // Debug: Check your browser console (F12) to see if this prints
  useEffect(() => {
    console.log("Video URL being used:", videoUrl);
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={true} options={{ lerp: isMobile ? 0 : 0.08, duration: isMobile ? 0 : 1.2, smoothWheel: !isMobile }}>
      <main ref={mainRef} className={`${THEME.bg} text-white selection:bg-emerald-500 ${syne.className} overflow-x-hidden min-h-screen relative`}>
        <Navbar
          navSolid={navSolid}
          servicesOpen={servicesOpen}
          setServicesOpen={setServicesOpen}
          servicesBtnRef={servicesBtnRef}

          panelRef={panelRef}
          scrollTo={scrollTo}
          scrollProg={0}
        />

        {/* --- CONTACT MODAL OVERLAY --- */}
        <AnimatePresence>
          {isContactOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md overflow-y-auto"
            >
              <div className="min-h-screen flex items-center justify-center p-4">
                <SpotlightGrid>
                  <button onClick={() => setIsContactOpen(false)} className="fixed top-6 right-6 z-[1001] rounded-full bg-emerald-500 p-3 text-black shadow-lg transition-transform hover:scale-110 active:scale-95">
                    <X size={24} />
                  </button>
                  <TiltCard>
                    <div className="relative overflow-hidden rounded-[32px] bg-zinc-950/90 border border-white/10 shadow-[0_0_100px_-20px_rgba(16,185,129,0.2)] backdrop-blur-2xl">
                      <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center text-white/60">Loading...</div>}>
                        <ContactFormContent onClose={() => setIsContactOpen(false)} />
                      </Suspense>
                    </div>
                  </TiltCard>
                </SpotlightGrid>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- VIDEO PREVIEW MODAL --- */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className={`w-full max-w-5xl ${THEME.cardBg} rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-emerald-500 hover:text-black border border-white/10 rounded-full flex items-center justify-center transition-all">
                  <X size={20} />
                </button>
                <div className="aspect-video bg-black relative flex items-center justify-center group border-b border-white/5">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                  <Play size={80} className="fill-white text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-8 flex justify-between items-end">
                  <div><h3 className="text-3xl font-bold mb-2">{selectedVideo.title}</h3><div className="flex gap-4 text-sm text-gray-400 font-mono"><span className="flex items-center gap-2"><MonitorPlay size={14} /> {selectedVideo.client}</span></div></div>
                  <div className="text-right"><div className="text-3xl font-mono text-emerald-500">{selectedVideo.views}</div><div className="text-xs text-gray-500 tracking-widest uppercase">Total Views</div></div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-40 border-b border-white/5 overflow-hidden">
          {!isMobile && <TimelineBackground />}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

          {/* Stickers */}
          <Sticker rotate="0deg" className="bg-[#EF4444] top-24 left-4 md:left-12 border-none shadow-[0_0_20px_rgba(239,68,68,0.5)]" float={!isMobile}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" /> REC <span className="font-mono ml-2 opacity-80">00:04:12</span>
          </Sticker>
          <Sticker rotate="-5deg" className="bg-[#8B5CF6] bottom-40 right-4 md:right-12" delay={0.2} float={!isMobile}>
            <FileVideo size={14} fill="black" /> RENDER: 99%
          </Sticker>
          <Sticker rotate="15deg" className="bg-[#F59E0B] bottom-20 left-10 hidden lg:flex" delay={0.5}>
            <Scissors size={14} fill="black" /> RAZOR_TOOL_V2
          </Sticker>

          <div className="z-10 text-center px-6 relative max-w-4xl mx-auto mt-10">
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-emerald-400 tracking-[0.2em] uppercase backdrop-blur-md">Available for New Projects</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl">
              SCALE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 italic">INFLUENCE.</span>
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-lg mb-10 font-light leading-relaxed">
              We don&apos;t just edit videos. We engineer attention spans for elite entrepreneurs using data-driven pacing and world-class VFX.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/923708729117" className="group relative inline-flex items-center gap-3 px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.5)]">
                <span>START PROJECT</span>
                <ArrowUpRight size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </a>
              <button onClick={() => setIsContactOpen(true)} className="group relative inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all backdrop-blur-md">
                <Calendar size={16} className="text-emerald-500" />
                <span>SCHEDULE CALL</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. SLOWER MARQUEE */}
        <section className="py-20 border-b border-white/5 relative overflow-hidden bg-black/50">
          <div className="relative flex w-full overflow-hidden mb-8">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10" />
            <motion.div className="flex" animate={{ x: "-50%" }} transition={{ ease: "linear", duration: isMobile ? 40 : 60, repeat: Infinity }}>
              {(isMobile ? [...ROW_1, ...ROW_1] : [...ROW_1, ...ROW_1, ...ROW_1]).map((p, i) => <MarqueeItem key={i} p={p} />)}
            </motion.div>
          </div>
          <div className="relative flex w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10" />
            <motion.div className="flex" initial={{ x: "-50%" }} animate={{ x: "0%" }} transition={{ ease: "linear", duration: isMobile ? 40 : 60, repeat: Infinity }}>
              {(isMobile ? [...ROW_2, ...ROW_2] : [...ROW_2, ...ROW_2, ...ROW_2]).map((p, i) => <MarqueeItem key={i} p={p} />)}
            </motion.div>
          </div>
        </section>

        {/* 3. VIRAL VELOCITY GRAPH */}
        <section id="process" className="py-20 px-4 md:px-6 border-b border-white/5 bg-[#080808] overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative aspect-square md:aspect-video bg-[#0A0A0A] rounded-3xl border border-white/10 p-8 shadow-2xl flex items-end">
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <BarChart3 className="text-emerald-500" size={20} />
                <span className="text-xs font-mono text-gray-400 uppercase">Algorithmic_Spike.v2</span>
              </div>
              <div className="absolute inset-0 p-8 grid grid-cols-6 grid-rows-4 pointer-events-none">
                {[...Array(24)].map((_, i) => <div key={i} className="border-r border-t border-white/5 last:border-r-0" />)}
              </div>
              <svg className="w-full h-full absolute inset-0 p-8 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,90 Q30,90 40,70 T60,50 T80,20 T100,0"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0,90 Q30,90 40,70 T60,50 T80,20 T100,0 V100 H0 Z"
                  fill="url(#gradient)"
                  opacity="0.2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.2 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
              <motion.div
                className="absolute top-[20%] right-[10%] bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2, type: "spring" }}
              >
                +450% REACH
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Proven Growth <br /> <span className="text-emerald-500">Methodology.</span></h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                We don&apos;t guess. We analyze thousands of viral clips to understand exactly what triggers the algorithm. Our &quot;Velocity Graph&quot; approach ensures every second of your video retains the viewer.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2.5s</div>
                  <div className="text-[10px] text-gray-500 uppercase">Hook Time</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">92%</div>
                  <div className="text-[10px] text-gray-500 uppercase">Retention</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. NEURAL EDITING ENGINE */}
        <section id="editing" className="py-20 px-4 md:px-6 border-b border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-16 left-0 md:-left-4">
                <Sticker rotate="-3deg" className="bg-[#8B5CF6] text-white static" float={true}><Layers size={14} className="inline mr-1" /> Complex VFX</Sticker>
              </div>
              <h2 className="text-3xl md:text-4xl md:text-6xl font-bold mb-6 leading-tight mt-6">Editing at the <br /><span className="text-emerald-500">Speed of Culture.</span></h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">Our &quot;Sync-Flow&quot; system isn&apos;t just a timeline; it&apos;s a retention engine. We combine sound design, color grading, and psychology to keep viewers hooked.</p>
              <ul className="space-y-4">
                {['Retention Optimization', 'Sound Design Engineering', 'Color Grading', 'Format Adaptation'].map((tag, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-mono text-gray-300">
                    <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={14} /></div>{tag}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col p-6 group">
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4 relative z-10">
                <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#FF5F57]" /><div className="w-3 h-3 rounded-full bg-[#FEBC2E]" /><div className="w-3 h-3 rounded-full bg-[#28C840]" /></div>
                <div className="text-[10px] font-mono text-gray-500">PREMIERE_PRO_V24.0.1</div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <motion.div animate={{ left: ["0%", "100%", "0%"] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-20">
                  <div className="absolute -top-2 -translate-x-1/2 text-red-500"><TrendingUp size={12} /></div>
                </motion.div>
                {[
                  { color: "border-indigo-500 bg-indigo-500/10 text-indigo-400", label: "A_ROLL", w: ["40%", "70%", "40%"] },
                  { color: "border-emerald-500 bg-emerald-500/10 text-emerald-400", label: "SFX_LAYER", w: ["60%", "30%", "60%"] },
                  { color: "border-amber-500 bg-amber-500/10 text-amber-400", label: "OVERLAYS", w: ["30%", "80%", "30%"] },
                  { color: "border-pink-500 bg-pink-500/10 text-pink-400", label: "TEXT_ANIM", w: ["50%", "20%", "50%"] }
                ].map((track, i) => (
                  <div key={i} className="h-10 bg-[#020202] rounded border border-white/5 overflow-hidden flex items-center relative w-full">
                    <motion.div className={`h-full border-l-2 flex items-center px-2 ${track.color}`} animate={{ width: track.w }} transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}>
                      <span className="text-[8px] font-mono opacity-80">{track.label}</span>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. SCROLLER VIDEO GALLERY */}
        <section id="work" className="py-16 md:py-24 relative">
          <div className="px-6 max-w-7xl mx-auto flex items-end justify-between mb-12">
            <div className="relative">
              <div className="absolute -top-8 left-0 md:left-auto md:-right-24 transform rotate-3">
                <span className="bg-[#10B981] text-black text-xs font-bold px-3 py-1 rounded-full border-2 border-black shadow-[3px_3px_0px_white]"><Video size={12} className="inline mr-1" /> NEW WORK</span>
              </div>
              <h2 className="text-4xl font-bold flex items-center gap-3">Selected Works</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-[10px] font-mono text-gray-400">LIVE FEED</span></div>
          </div>


          {/* ARROW CONTROLS */}
          <div className="absolute top-[60%] -translate-y-1/2 left-0 right-0 px-4 pointer-events-none flex justify-between z-30">
            <button
              onClick={() => scrollResult('left')}
              className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scrollResult('right')}
              className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 px-6 pb-12 snap-x hide-scrollbar cursor-grab active:cursor-grabbing"
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {VIDEOS.map((video) => (
              <div key={video.id} onClick={() => !isDragging && setSelectedVideo(video)} className="group relative min-w-[280px] md:min-w-[350px] aspect-[9/16] bg-[#0A0A0A] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-emerald-500/50 transition-all snap-center hover:-translate-y-2 select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 z-20">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded rotate-3 shadow-lg">{video.sticker}</motion.div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black transition-all"><Play fill="currentColor" className="ml-1" size={24} /></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                  <p className="text-emerald-500 text-[10px] font-mono mb-1 uppercase tracking-wider">{video.client}</p>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{video.title}</h3>
                  <div className="mt-2 text-xs text-gray-500 font-mono">{video.views} VIEWS</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FINAL CTA: FLOATING HOLOGRAPHIC CINEMA */}
        <section className="py-40 relative overflow-hidden border-t border-white/5 flex items-center justify-center perspective-[1200px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
          <motion.div
            initial={{ rotateX: 25, scale: 0.85, opacity: 0, y: 50 }}
            whileInView={{ rotateX: 15, scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-5xl aspect-video z-0 pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] bg-[#050505]">
              {/* VIDEO ELEMENT (NO FILTERS, HIGH OPACITY) */}
              <video
                className="w-full h-full object-cover opacity-80"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_3px,transparent_3px)] bg-[size:100%_6px] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
              <div className="absolute bottom-6 left-8 flex gap-2">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                <span className="text-[8px] font-mono text-emerald-500 tracking-widest">LIVE_FEED_V.04</span>
              </div>
            </div>
          </motion.div>
          <div className="max-w-4xl mx-auto text-center px-6 relative z-10 pt-20">
            <div className="flex justify-center mb-8">
              <div className="bg-[#FB7185] text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-black uppercase shadow-[0_0_25px_rgba(251,113,133,0.4)] animate-pulse">
                <Heart size={14} fill="currentColor" /> High Retention
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-8xl font-bold mb-8 tracking-tighter drop-shadow-2xl">
              Ready to dominate?
            </h2>
            <p className="text-gray-400 mb-12 text-lg font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Join the top 1% of creators who leverage our infrastructure to build
              <span className="text-white font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mx-1">massive organic authority.</span>
            </p>
            <a
              href="https://wa.me/923708729117"
              target="_blank"
              className="group inline-block relative overflow-hidden rounded-full p-[2px] hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#050505_0%,#10B981_50%,#050505_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#0A0A0A] px-10 py-5 text-xl font-bold text-white backdrop-blur-3xl gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                GET STARTED
              </span>
            </a>
          </div>
        </section>

      </main>
    </ReactLenis >
  );
}
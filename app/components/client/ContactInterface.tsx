"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/app/lib/cn";
import { supabase } from "@/app/lib/supabaseClient";
import { ChevronDown, Calendar, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Constants ────────────────────────────────────────────────────────────────
const SERVICE_OPTIONS: Record<string, string[]> = {
  "Website Development": ["E-Commerce", "Sa'aS Platform", "Landing Page", "Portfolio", "Dashboard"],
  "Mobile Application": ["iOS (Swift)", "Android (Kotlin)", "React Native", "Flutter", "Tablet App"],
  "Video Editing": ["Commercial Ad", "YouTube Content", "Social Reels", "Corporate", "Documentary"],
  "SEO & Insights": ["Technical Audit", "Content Strategy", "Backlink Campaign", "Local SEO", "Analytics Setup"],
  "AI / ML Models": ["Chatbot / Agent", "Data Prediction", "Image Recognition", "Automation", "NLP Model"],
};

const CURRENCY_MAP: Record<string, { code: string; rate: number; locale: string }> = {
  PK: { code: "PKR", rate: 278.5, locale: "ur-PK" },
  IN: { code: "INR", rate: 83.5, locale: "en-IN" },
  US: { code: "USD", rate: 1, locale: "en-US" },
  AE: { code: "AED", rate: 3.67, locale: "ar-AE" },
  GB: { code: "GBP", rate: 0.79, locale: "en-GB" },
  EU: { code: "EUR", rate: 0.92, locale: "de-DE" },
};

// ── Spotlight Grid ───────────────────────────────────────────────────────────
function SpotlightGrid({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div
      className="group relative min-h-screen w-full overflow-hidden bg-black p-4 flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(16,185,129,0.15), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

// ── Tilt Card ────────────────────────────────────────────────────────────────
function TiltCard({ children }: { children: React.ReactNode }) {
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

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

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

// ── Main Component ───────────────────────────────────────────────────────────
export default function ContactInterface({
  onClose,
  isModal = false,
}: {
  onClose?: () => void;
  isModal?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams(); // ← Yeh top-level pe safe hai ("use client" component mein)

  return (
    <SpotlightGrid>
      {/* Close Button */}
      <button
        onClick={() => onClose ? onClose() : router.back()}
        className="fixed top-6 right-6 z-[1001] rounded-full bg-emerald-500 p-3 text-black shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <X size={24} />
      </button>

      <TiltCard>
        <div className="relative overflow-hidden rounded-[32px] bg-zinc-950/90 border border-white/10 shadow-[0_0_100px_-20px_rgba(16,185,129,0.2)] backdrop-blur-2xl">
          {/* Suspense yahan rakha – inner form ko dynamic loading deta hai */}
          <Suspense fallback={
            <div className="min-h-[600px] flex items-center justify-center text-white/60">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Loading project inquiry form...</p>
              </div>
            </div>
          }>
            <ContactFormContent 
              searchParams={searchParams} 
              router={router} 
              onClose={onClose} 
            />
          </Suspense>
        </div>
      </TiltCard>
    </SpotlightGrid>
  );
}

// ── Inner Form Logic (no hooks here – props se le rahe hain) ────────────────
function ContactFormContent({
  searchParams,
  router,
  onClose,
}: {
  searchParams: ReturnType<typeof useSearchParams>;
  router: ReturnType<typeof useRouter>;
  onClose?: () => void;
}) {
  const [service, setService] = useState("Website Development");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Logic states
  const [predictedCost, setPredictedCost] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currencyConfig, setCurrencyConfig] = useState(CURRENCY_MAP["US"]);
  const [formattedMarket, setFormattedMarket] = useState("$0");
  const [formattedXovato, setFormattedXovato] = useState("$0");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  // 1. Initialize from URL param
  useEffect(() => {
    const s = searchParams?.get("interest");
    if (s && SERVICE_OPTIONS[s]) {
      setService(s);
      setSelectedTypes([]);
      setPredictedCost(0);
      setStep(1);
    }
  }, [searchParams]);

  // 2. Detect region for currency
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

  // 3. Format predicted costs
  useEffect(() => {
    const total = predictedCost * currencyConfig.rate;
    const xovato = total * 0.75;
    const fmt = new Intl.NumberFormat(currencyConfig.locale, {
      style: "currency",
      currency: currencyConfig.code,
      maximumFractionDigits: 0,
    });
    setFormattedMarket(fmt.format(total));
    setFormattedXovato(fmt.format(xovato));
  }, [predictedCost, currencyConfig]);

  // 4. Market cost prediction
  useEffect(() => {
    if (selectedTypes.length === 0) {
      setPredictedCost(0);
      return;
    }

    setIsAiThinking(true);

    const timer = setTimeout(async () => {
      try {
        const query = `${service} ${selectedTypes.join(" ")}`;
        const res = await fetch(`/api/market?q=${encodeURIComponent(query)}`);

        if (!res.ok) throw new Error(`Market API failed: ${res.status}`);

        const data = await res.json();
        if (typeof data.price === "number") {
          setPredictedCost(data.price);
        } else {
          setPredictedCost(0);
        }
      } catch (e) {
        console.error("Market fetch failed:", e);
        setPredictedCost(0);
      } finally {
        setIsAiThinking(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedTypes, service]);

  const toggleType = (t: string) =>
    setSelectedTypes((p) => (p.includes(t) ? p.filter((i) => i !== t) : [...p, t]));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

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
    setLoading(false);
  };

  if (status === "success") {
    const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_API_URL || "#";

    return (
      <div className="p-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-5xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          🚀
        </div>
        <h2 className="mb-2 text-3xl font-bold text-white">Signal Received</h2>
        <p className="text-white/60 mb-6 text-sm">
          Your project inquiry has been securely transmitted. A strategist will contact you shortly.
        </p>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg hover:bg-emerald-400 transition-all"
        >
          <Calendar size={16} />
          Book a Follow-up Call
        </a>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-xs font-bold uppercase text-emerald-500 hover:text-emerald-400"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12">
      {/* LEFT: FORM */}
      <div className="lg:col-span-7 p-6 sm:p-10 relative z-20">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-950/50 border border-emerald-500/20 px-3 py-1"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">Secure Link</span>
            </motion.div>

            <div className="relative group">
              <select
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setSelectedTypes([]);
                  setStep(1);
                }}
                className="appearance-none bg-zinc-900/80 border border-white/10 text-white text-[11px] font-medium uppercase tracking-wide rounded-full pl-4 pr-8 py-1.5 outline-none focus:border-emerald-500/50 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                {Object.keys(SERVICE_OPTIONS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Initiate <span className="text-emerald-500">{service.split(" ")[0]}</span> Protocol
          </h1>
          <p className="text-white/50 text-sm">Configure parameters. AI analysis active.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 block">
                    Select Modules
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICE_OPTIONS[service]?.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => toggleType(opt)}
                        className={cn(
                          "cursor-pointer relative overflow-hidden rounded-lg border px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 group",
                          selectedTypes.includes(opt)
                            ? "border-emerald-500 bg-emerald-500/10 text-white"
                            : "border-white/5 bg-white/5 text-white/50 hover:border-emerald-500/30 hover:text-white"
                        )}
                      >
                        <span className="relative z-10">{opt}</span>
                        {selectedTypes.includes(opt) && (
                          <motion.div layoutId="highlight" className="absolute inset-0 bg-emerald-500/10 z-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={selectedTypes.length === 0}
                    className="group relative overflow-hidden rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Proceed <span className="text-sm">→</span>
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">
                      Identity
                    </label>
                    <input
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Name"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">
                      Comms
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">
                    Brief
                  </label>
                  <textarea
                    name="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    placeholder="Objective..."
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name || !email}
                    className="group relative overflow-hidden rounded-full bg-emerald-500 px-8 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Execute Protocol"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* RIGHT: COMPACT DASHBOARD */}
      <div className="lg:col-span-5 relative bg-zinc-900/50 border-l border-white/10 p-6 sm:p-10 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">
              Market Analysis
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-mono font-bold text-white tracking-tighter">
                {isAiThinking ? (
                  <span className="animate-pulse text-emerald-500 text-xl">SCANNING...</span>
                ) : (
                  formattedMarket
                )}
              </span>
              {!isAiThinking && <span className="text-xs text-white/40 mb-1">Avg.</span>}
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 to-transparent" />
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
              Xovato Optimized
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-mono font-black text-emerald-400 tracking-tighter">
                {isAiThinking ? (
                  <span className="opacity-50 text-3xl">---</span>
                ) : (
                  formattedXovato
                )}
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400 border border-emerald-500/20">
              <span>Valuation Optimized</span>
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/40 p-3">
            <p className="text-[10px] font-mono text-white/40 leading-relaxed">
              "Automated systems reduce overhead, passing efficiency directly to capital."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
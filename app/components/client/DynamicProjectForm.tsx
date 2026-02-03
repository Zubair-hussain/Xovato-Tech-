"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabaseClient";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS: Options Only (Prices are now handled by AI)
   ───────────────────────────────────────────────────────────────────────────── */
const SERVICE_OPTIONS: Record<string, string[]> = {
  "Website Development": ["E-Commerce", "SaaS Platform", "Landing Page", "Portfolio", "Dashboard"],
  "Mobile Application": ["iOS (Swift)", "Android (Kotlin)", "React Native", "Flutter", "Tablet App"],
  "Video Editing": ["Commercial Ad", "YouTube Content", "Social Reels", "Corporate", "Documentary"],
  "SEO & Insights": ["Technical Audit", "Content Strategy", "Backlink Campaign", "Local SEO", "Analytics Setup"],
  "AI / ML Models": ["Chatbot / Agent", "Data Prediction", "Image Recog.", "Automation", "NLP Model"],
  "General": ["Consultation", "Partnership", "Other"],
};

const BG_IMAGES: Record<string, string> = {
  "Website Development": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop",
  "Mobile Application": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2000&auto=format&fit=crop",
  "Video Editing": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44c?q=80&w=2000&auto=format&fit=crop",
  "SEO & Insights": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
  "AI / ML Models": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop",
  "General": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop",
};

// Budget Brackets for AI Recommendation logic
const BUDGET_BRACKETS = [
  { label: "Starter", range: "<$5k", min: 0, max: 5000 },
  { label: "Standard", range: "$5k - $10k", min: 5000, max: 10000 },
  { label: "Growth", range: "$10k - $25k", min: 10000, max: 25000 },
  { label: "Enterprise", range: "$25k+", min: 25000, max: 999999 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CURRENCY MAP
   ───────────────────────────────────────────────────────────────────────────── */
const CURRENCY_MAP: Record<string, { code: string, rate: number, locale: string }> = {
  'PK': { code: 'PKR', rate: 278.5, locale: 'ur-PK' },
  'IN': { code: 'INR', rate: 83.5, locale: 'en-IN' },
  'AE': { code: 'AED', rate: 3.67, locale: 'ar-AE' },
  'SA': { code: 'SAR', rate: 3.75, locale: 'ar-SA' },
  'GB': { code: 'GBP', rate: 0.79, locale: 'en-GB' },
  'EU': { code: 'EUR', rate: 0.92, locale: 'de-DE' },
  'CA': { code: 'CAD', rate: 1.36, locale: 'en-CA' },
  'AU': { code: 'AUD', rate: 1.52, locale: 'en-AU' },
  'US': { code: 'USD', rate: 1, locale: 'en-US' },
};

export default function DynamicProjectForm() {
  const searchParams = useSearchParams();
  const [service, setService] = useState("Website Development");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // AI Pricing State
  const [predictedCost, setPredictedCost] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Localization State
  const [currencyConfig, setCurrencyConfig] = useState(CURRENCY_MAP['US']);
  const [formattedMarket, setFormattedMarket] = useState("$0");
  const [formattedXovato, setFormattedXovato] = useState("$0");

  useEffect(() => {
    const s = searchParams.get("interest");
    if (s && SERVICE_OPTIONS[s]) {
      setService(s);
      setSelectedTypes([]);
      setPredictedCost(0);
      setStep(1);
    }
  }, [searchParams]);

  // Auto-Detect Region
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let detectedRegion = 'US';
    if (timeZone.includes("Karachi")) detectedRegion = 'PK';
    else if (timeZone.includes("Calcutta")) detectedRegion = 'IN';
    else if (timeZone.includes("Dubai")) detectedRegion = 'AE';
    else if (timeZone.includes("Riyadh")) detectedRegion = 'SA';
    else if (timeZone.includes("London")) detectedRegion = 'GB';
    else if (timeZone.includes("Berlin") || timeZone.includes("Paris")) detectedRegion = 'EU';
    else if (timeZone.includes("Toronto")) detectedRegion = 'CA';
    else if (timeZone.includes("Sydney")) detectedRegion = 'AU';
    setCurrencyConfig(CURRENCY_MAP[detectedRegion] || CURRENCY_MAP['US']);
  }, []);

  // Format Price when Prediction Updates
  useEffect(() => {
    const convertedTotal = predictedCost * currencyConfig.rate;
    const xovatoTotal = convertedTotal * 0.75; // Efficiency Estimate

    const formatter = new Intl.NumberFormat(currencyConfig.locale, {
      style: "currency",
      currency: currencyConfig.code,
      maximumFractionDigits: 0,
    });

    setFormattedMarket(formatter.format(convertedTotal));
    setFormattedXovato(formatter.format(xovatoTotal));
  }, [predictedCost, currencyConfig]);

  // ✅ AI PREDICTION HANDLER (Debounced)
  useEffect(() => {
    if (selectedTypes.length === 0) {
      setPredictedCost(0);
      return;
    }

    setIsAiThinking(true);

    const timer = setTimeout(async () => {
      try {
        const query = `${service} ${selectedTypes.join(" ")}`;
        const response = await fetch(`/api/market?q=${encodeURIComponent(query)}`);

        if (!response.ok) throw new Error("Market API Failed");

        const data = await response.json();

        if (typeof data.price === "number") {
          setPredictedCost(data.price);
        }
      } catch (error) {
        console.error("Market Prediction Error:", error);
      } finally {
        setIsAiThinking(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedTypes, service]);


  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      source_id: service,
      project_types: selectedTypes,
      ai_estimated_cost_usd: predictedCost,
      client_currency: currencyConfig.code,
      client_name: formData.get("name"),
      client_email: formData.get("email"),
      details: formData.get("details"),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // 1. Save to Supabase
    const { error: dbError } = await supabase.from("project_inquiries").insert([data]);

    // 2. Call Cloudflare Calendar API (via proxy)
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          action: 'schedule_call'
        }),
      });
    } catch (apiErr) {
      console.error("Calendar API proxy failed:", apiErr);
    }

    if (dbError) {
      console.error(dbError);
      setStatus("error");
    } else {
      setStatus("success");
    }
    setLoading(false);
  };

  if (status === "success") return <SuccessScreen service={service} />;

  return (
    <section id="contact" className="relative min-h-[900px] w-full overflow-hidden bg-black py-16 sm:py-24 text-white">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          key={service}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGES[service] || BG_IMAGES["General"]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/90 to-emerald-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-black/60 to-black" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">

        <div className="mb-12 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="mb-6 flex flex-col items-center gap-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-6 py-2 backdrop-blur-md">
              <span className="text-lg">✨</span>
              <span className="text-xs sm:text-sm font-medium italic text-emerald-100/80">
                "Innovation distinguishes between a leader and a follower."
              </span>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Let's Craft Your <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                {service}
              </span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* LEFT: FORM */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-1 backdrop-blur-xl shadow-2xl">
              <div className="rounded-[20px] bg-black/40 p-6 sm:p-8">
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">

                    {/* STEP 1: OPTIONS & AI BUDGET */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                      >
                        <div>
                          <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-white/40">Select Components</label>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {SERVICE_OPTIONS[service]?.map((opt) => (
                              <div
                                key={opt}
                                onClick={() => toggleType(opt)}
                                className={cn(
                                  "cursor-pointer rounded-xl border px-3 py-4 text-center text-xs sm:text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                                  selectedTypes.includes(opt)
                                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:bg-white/10"
                                )}
                              >
                                <span className="relative z-10">{opt}</span>
                                {selectedTypes.includes(opt) && (
                                  <motion.div layoutId="glow" className="absolute inset-0 bg-emerald-500/10 -z-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Budget Buttons (Visual Selection) */}
                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <label className="block text-sm font-bold uppercase tracking-wider text-white/40">Your Budget Range</label>
                            {predictedCost > 0 && (
                              <span className="text-[10px] text-emerald-400 animate-pulse">
                                ✨ AI Suggestion Ready
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {BUDGET_BRACKETS.map((b) => {
                              // AI Logic: Highlight if within range
                              const isRecommended = predictedCost > 0 && predictedCost >= b.min && predictedCost < b.max;
                              const isSelected = budget === b.range;

                              return (
                                <motion.div
                                  key={b.range}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setBudget(b.range)}
                                  className={cn(
                                    "relative cursor-pointer rounded-full border px-5 py-2 text-xs sm:text-sm transition-all overflow-hidden",
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20"
                                      : isRecommended
                                        ? "border-emerald-500/60 text-emerald-300 bg-emerald-900/20 ring-1 ring-emerald-500/50"
                                        : "border-white/10 bg-transparent text-white/50 hover:border-white/30"
                                  )}
                                >
                                  {b.range}
                                  {isRecommended && !isSelected && (
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={selectedTypes.length === 0 || !budget}
                            className="group flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black disabled:opacity-50 transition-all hover:scale-105 hover:bg-emerald-50"
                          >
                            Continue to Details
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: PERSONAL DETAILS */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-emerald-500">Your Name</label>
                            <input name="name" required placeholder="Who should we address?" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-white/20" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-emerald-500">Email Address</label>
                            <input name="email" type="email" required placeholder="Where can we reach you?" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-white/20" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-emerald-500">Project Vision</label>
                          <textarea name="details" rows={4} placeholder="Describe your dream outcome..." className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-white/20" />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <button type="button" onClick={() => setStep(1)} className="text-sm text-white/50 hover:text-white transition-colors">← Adjust</button>
                          <button type="submit" disabled={loading} className="relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-10 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform hover:scale-105">
                            {loading ? "Sending..." : "Schedule Call"}
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: AI INTELLIGENCE DASHBOARD */}
          <div className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-2 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    AI Valuation Engine
                  </span>
                </div>

                <div className="space-y-4">
                  {/* PROFESSIONAL TERM 1 */}
                  <div className="flex justify-between items-center text-sm text-white/50">
                    <span>Industry Standard Valuation</span>
                    {isAiThinking ? (
                      <span className="animate-pulse text-xs text-emerald-500">Neural Analysis...</span>
                    ) : (
                      <span className="line-through decoration-red-500/50 decoration-2">{formattedMarket}</span>
                    )}
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  {/* PROFESSIONAL TERM 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">Xovato Efficiency Estimate</span>
                      {isAiThinking ? (
                        <div className="h-6 w-20 rounded bg-white/10 animate-pulse" />
                      ) : (
                        <span className="text-2xl font-bold text-white">{formattedXovato}</span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                        Efficiency Optimized
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-black/40 border border-white/5 p-4">
                  <p className="text-xs italic text-white/40 leading-relaxed text-center">
                    "Excellence is not an expense, it is an investment. We deliver premium engineering that respects your vision and capital."
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

function SuccessScreen({ service }: { service: string }) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-black px-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md rounded-3xl border border-emerald-500/30 bg-zinc-900/80 p-10 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-5xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            🎉
          </div>
          <h2 className="mb-2 text-3xl font-bold text-white">Application Received</h2>
          <p className="text-white/60 mb-6">
            We are honored you chose us for your <strong className="text-emerald-400">{service}</strong> journey.
          </p>
          <div className="rounded-xl bg-black/50 p-4 text-xs text-white/40 italic">
            "Great things are done by a series of small things brought together."
          </div>
        </div>
      </motion.div>
    </section>
  );
}

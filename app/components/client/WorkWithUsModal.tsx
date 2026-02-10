'use client';

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
  animate
} from "framer-motion";
import {
  Check,
  ChevronRight,
  ArrowLeft,
  X,
  Globe2,
  Cpu,
  Code2,
  Smartphone,
  Video,
  Search,
  Zap,
  Loader2
} from "lucide-react";
import { cn } from "@/app/lib/cn";
import { supabase } from "@/app/lib/supabaseClient";

// --- Configuration & Data ---
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Website Development": <Code2 className="w-5 h-5" />,
  "Mobile Application": <Smartphone className="w-5 h-5" />,
  "Video Editing": <Video className="w-5 h-5" />,
  "SEO & Insights": <Search className="w-5 h-5" />,
  "AI / ML Models": <Cpu className="w-5 h-5" />,
};

const SERVICE_OPTIONS: Record<string, string[]> = {
  "Website Development": ["E-Commerce", "SaaS Platform", "Landing Page", "Portfolio", "Dashboard", "CMS Integration"],
  "Mobile Application": ["iOS (Swift)", "Android (Kotlin)", "React Native", "Flutter", "Tablet App", "WatchOS"],
  "Video Editing": ["Commercial Ad", "YouTube Content", "Social Reels", "Corporate", "Documentary", "VFX Cleanups"],
  "SEO & Insights": ["Technical Audit", "Content Strategy", "Backlink Campaign", "Local SEO", "Analytics Setup", "Heatmaps"],
  "AI / ML Models": ["Chatbot / Agent", "Data Prediction", "Image Recognition", "Automation", "NLP Model", "Fine-tuning"],
};

const CURRENCY_MAP: Record<string, { code: string; rate: number; locale: string }> = {
  PK: { code: "PKR", rate: 278.5, locale: "ur-PK" },
  IN: { code: "INR", rate: 83.5, locale: "en-IN" },
  US: { code: "USD", rate: 1, locale: "en-US" },
  AE: { code: "AED", rate: 3.67, locale: "ar-AE" },
  GB: { code: "GBP", rate: 0.79, locale: "en-GB" },
  EU: { code: "EUR", rate: 0.92, locale: "de-DE" },
};

// --- Animated Components ---

function AnimatedNumber({ value, currency, locale }: { value: number, currency: string, locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(v) {
        node.textContent = new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0,
        }).format(v);
      },
    });

    return () => controls.stop();
  }, [value, currency, locale]);

  return <span ref={ref} />;
}

function SpotlightBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-[#020604]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.15),
              transparent 80%
            )
          `,
        }}
      />
    </div>
  );
}

// --- Main Component ---

export default function WorkWithUsModal({
  onClose,
  isOpen = true,
  isModal = false
}: {
  onClose?: () => void;
  isOpen?: boolean;
  isModal?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [step, setStep] = useState(1);
  const [service, setService] = useState("Website Development");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Logic State
  const [predictedCost, setPredictedCost] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  const [currencyConfig, setCurrencyConfig] = useState(CURRENCY_MAP["US"]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // 1. Initialize & Detect Region
  useEffect(() => {
    const s = searchParams.get("interest");
    if (s && SERVICE_OPTIONS[s]) setService(s);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let region = "US";
    if (timeZone.includes("Karachi")) region = "PK";
    else if (timeZone.includes("Calcutta")) region = "IN";
    else if (timeZone.includes("Dubai")) region = "AE";
    else if (timeZone.includes("London")) region = "GB";
    else if (timeZone.includes("Berlin")) region = "EU";
    setCurrencyConfig(CURRENCY_MAP[region] || CURRENCY_MAP["US"]);
  }, [searchParams]);

  // 2. Cost Simulation (Mocking the API for smooth UI demo)
  useEffect(() => {
    if (selectedTypes.length === 0) {
      setPredictedCost(0);
      return;
    }
    setIsComputing(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock calculation logic: Base $500 + $300 per item selected
      const base = 500;
      const variable = selectedTypes.length * 450;
      setPredictedCost(base + variable);
      setIsComputing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedTypes, service]);

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Supabase Insert
    const { error } = await supabase.from("project_inquiries").insert([{
      source_id: service,
      project_types: selectedTypes,
      ai_estimated_cost_usd: predictedCost,
      client_currency: currencyConfig.code,
      client_name: name,
      client_email: email,
      details,
      status: "pending",
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Success View
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020604] p-6">
        <SpotlightBackground />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 max-w-lg w-full bg-black/40 backdrop-blur-xl border border-emerald-500/30 p-12 rounded-3xl text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Transmission Received</h2>
          <p className="text-gray-400 mb-8">
            Your project brief has been securely logged in our system. A Xovato strategist will analyze the data and contact you within 24 hours.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium transition-all w-full"
          >
            Return to Base
          </button>
        </motion.div>
      </div>
    );
  }

  const content = (
    <div className={cn("min-h-screen bg-[#020604] text-white selection:bg-emerald-500/30 flex items-center justify-center p-4 md:p-8 pt-24 overflow-y-auto md:overflow-hidden relative", isModal && "min-h-full bg-transparent pt-4")}>
      {!isModal && <SpotlightBackground />}

      {/* Close Button */}
      <button
        onClick={() => onClose ? onClose() : router.back()}
        className="absolute top-8 right-8 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-6xl z-10 grid lg:grid-cols-12 gap-8 lg:h-[700px] h-auto">

        {/* --- LEFT COLUMN: Live Dashboard --- */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-4 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-50" />

          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">Live Estimation</span>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Target Service</p>
                <div className="text-xl font-semibold text-white flex items-center gap-2">
                  {SERVICE_ICONS[service]}
                  {service}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Modules Selected</p>
                <div className="text-3xl font-bold text-white font-mono">
                  {selectedTypes.length > 0 ? selectedTypes.length.toString().padStart(2, '0') : '--'}
                </div>
              </div>

              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">AI Projected Cost ({currencyConfig.code})</p>
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 font-mono tracking-tight">
                  {isComputing ? (
                    <span className="animate-pulse text-white/50">CALCULATING...</span>
                  ) : (
                    <AnimatedNumber
                      value={predictedCost * currencyConfig.rate}
                      currency={currencyConfig.code}
                      locale={currencyConfig.locale}
                    />
                  )}
                </div>
                <div className="mt-2 text-[10px] text-emerald-500/60 flex items-center gap-1">
                  <Zap size={12} />
                  <span>Xovato Efficiency Optimization Applied (-25%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Globe2 className="w-4 h-4" />
              <span>Region Detected: {currencyConfig.code}</span>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT COLUMN: Interactive Form --- */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-8 bg-[#0A0F0C] border border-white/10 rounded-3xl p-8 md:p-12 relative flex flex-col"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
            <motion.div
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] lg:max-h-none">
            <AnimatePresence mode="wait">

              {/* STEP 1: Service Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold text-white">What are we building?</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.keys(SERVICE_OPTIONS).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setService(opt); setSelectedTypes([]); setStep(2); }}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-xl border transition-all text-left group",
                          service === opt
                            ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-emerald-500/50 hover:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-lg transition-colors",
                          service === opt ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-400 group-hover:text-white"
                        )}>
                          {SERVICE_ICONS[opt]}
                        </div>
                        <span className="font-semibold text-lg">{opt}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Features */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold text-white">Select Capabilities</h2>
                  <p className="text-gray-400">Choose the modules required for your <span className="text-emerald-400">{service}</span>.</p>

                  <div className="flex flex-wrap gap-3">
                    {SERVICE_OPTIONS[service].map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={cn(
                          "px-6 py-3 rounded-full text-sm font-medium border transition-all flex items-center gap-2",
                          selectedTypes.includes(type)
                            ? "bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20"
                            : "bg-transparent text-gray-400 border-white/20 hover:border-white hover:text-white"
                        )}
                      >
                        {selectedTypes.includes(type) && <Check size={14} />}
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white">
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={selectedTypes.length === 0}
                      className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Details & Contact */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold text-white">Finalize Protocol</h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-emerald-500 tracking-wider">Identity</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-emerald-500 tracking-wider">Communication</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Work Email"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold text-emerald-500 tracking-wider">Brief</label>
                      <textarea
                        rows={4}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Tell us about your goals, timeline, and vision..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white">
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                      >
                        {status === 'submitting' ? (
                          <> <Loader2 className="animate-spin" /> Processing... </>
                        ) : (
                          <> Launch Project <Zap className="fill-white" size={18} /> </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full max-w-7xl max-h-[95vh] relative"
            >
              {// We render content directly here, but need to be careful about SpotlightBackground being fixed.
                // Since we rendered SpotlightBackground conditionally based on !isModal, it won't be fixed to full screen if modal.
                // However, Content itself has min-h-screen etc. we changed that with cn(...) in content definition.
              }
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return content;
}

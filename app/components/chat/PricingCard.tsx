"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Smartphone, Video, BarChart3, Brain } from "lucide-react";

const pricingItems = [
    { service: "Web Dev", icon: Globe, price: "Custom" },
    { service: "Mobile", icon: Smartphone, price: "Custom" },
    { service: "Video", icon: Video, price: "Custom" },
    { service: "SEO", icon: BarChart3, price: "Custom" },
    { service: "AI/ML", icon: Brain, price: "Custom" },
];

export default function PricingCard() {
    return (
        <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Prices are Expected on services!
                </h4>
                <div className="space-y-3">
                    {pricingItems.map((item, i) => (
                        <motion.div
                            key={item.service}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 hover:border-emerald-500/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon size={18} />
                                </div>
                                <span className="text-sm font-medium text-white/90">{item.service}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500/80">{item.price}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

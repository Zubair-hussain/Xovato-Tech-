'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Code2,
    Smartphone,
    Palette,
    Video,
    TrendingUp,
    BrainCircuit,
    ArrowRight,
    CheckCircle2,
    Zap,
    Users,
    Award,
    X
} from 'lucide-react';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';

// --- Typography ---
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// --- Animation Variants ---
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
} as any;

// --- Data ---
const services = [
    {
        title: "Web Development",
        desc: "From WordPress & Shopify to custom Next.js solutions. We handle HTML, CSS, JS, and complex architectures.",
        icon: <Code2 className="w-6 h-6" />,
        gradient: "from-emerald-500 to-teal-400"
    },
    {
        title: "Mobile Applications",
        desc: "Native and Cross-platform apps engineered for performance. iOS and Android solutions that scale.",
        icon: <Smartphone className="w-6 h-6" />,
        gradient: "from-green-400 to-emerald-600"
    },
    {
        title: "AI & Machine Learning",
        desc: "Leveraging our AI capability to make systems smarter and more accurate. Automation and predictive models.",
        icon: <BrainCircuit className="w-6 h-6" />,
        gradient: "from-emerald-300 to-green-500"
    },
    {
        title: "SEO & Growth",
        desc: "Data-driven SEO strategies to rank your brand at the top. We focus on conversion and organic reach.",
        icon: <TrendingUp className="w-6 h-6" />,
        gradient: "from-teal-400 to-emerald-400"
    },
    {
        title: "Graphic Design",
        desc: "Premium UI/UX and brand identity. Visuals that tell your story with pixel-perfect precision.",
        icon: <Palette className="w-6 h-6" />,
        gradient: "from-emerald-600 to-teal-600"
    },
    {
        title: "Video Editing",
        desc: "Cinematic storytelling for the digital age. High-retention editing for ads, social media, and corporate.",
        icon: <Video className="w-6 h-6" />,
        gradient: "from-green-500 to-emerald-400"
    }
];

const stats = [
    { label: "Expert Developers", value: "30+", icon: <Users className="w-5 h-5 text-emerald-400" /> },
    { label: "Avg. Experience", value: "10.5 Yrs", icon: <Award className="w-5 h-5 text-emerald-400" /> },
    { label: "AI Precision", value: "100%", icon: <Zap className="w-5 h-5 text-emerald-400" /> },
];

export default function ViewCase() {
    const router = useRouter();
    return (
        <main className={`min-h-screen bg-[#020604] text-gray-200 selection:bg-emerald-500/30 ${inter.className}`}>
            {/* --- CLOSE BUTTON --- */}
            <button
                onClick={() => router.back()}
                className="fixed top-6 right-6 z-[100] w-12 h-12 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 hover:border-emerald-500 flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-md hover:scale-110 active:scale-95"
                title="Close and return"
            >
                <X size={24} />
            </button>

            {/* NOTE: Since you have a fixed Navbar, we add 'pt-28' (padding-top) 
        to ensure the Hero content isn't hidden behind it.
      */}

            {/* --- Background Ambient Glow --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-teal-900/10 blur-[100px] rounded-full" />
            </div>

            {/* --- Hero Section --- */}
            <section className="relative pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Xovato AI-Enhanced Systems
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                        Digital Perfection. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 animate-gradient-x">
                            Powered by Intellect.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        We blend 10.5 years of average developer mastery with cutting-edge AI capabilities.
                        From WordPress to Complex ML algorithms, we build the extraordinary.
                    </p>

                    <div className="flex justify-center">
                        <a href="/services" className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2">
                            Explore Services
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </motion.div>

                {/* --- Stats Floating Bar --- */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-20"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center justify-center gap-4 border-b md:border-b-0 md:border-r border-white/10 last:border-0 pb-4 md:pb-0">
                                <div className="p-3 bg-emerald-900/30 rounded-lg">
                                    {stat.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                    <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* --- Services Section --- */}
            <section className="relative py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Premium Ecosystem</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Whether it's a simple Shopify store or a complex AI-driven application,
                        our senior engineers deliver excellence.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            whileHover={{ y: -5 }}
                            className="group relative p-8 rounded-2xl bg-[#0A120F] border border-white/5 hover:border-emerald-500/30 transition-colors overflow-hidden"
                        >
                            {/* Hover Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {service.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* --- Feature/About Section --- */}
            <section className="py-24 px-6 bg-gradient-to-b from-transparent to-emerald-950/20 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Why leading brands choose <span className="text-emerald-400">Xovato</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            We don't just write code; we engineer success. With an average developer experience of 10.5 years, we bypass common pitfalls and deliver scalability from Day 1.
                        </p>

                        <div className="space-y-4">
                            {[
                                "AI-Calibrated Accuracy for zero-error deployments",
                                "Technology agnostic: WordPress, Shopify, or Custom Stack",
                                "Senior-only teams for faster delivery",
                                "End-to-end service: Design, Dev, SEO, Video"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-gray-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Abstract Visual Representation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 bg-[#050a07] border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                <div className="text-white font-mono text-sm">Xovato_Engine.ts</div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                </div>
                            </div>

                            {/* Animated Code Mockup */}
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex">
                                    <span className="w-6 text-gray-600">1</span>
                                    <span className="text-purple-400">import</span>
                                    <span className="text-white ml-2">{`{ Expertise }`}</span>
                                    <span className="text-purple-400 ml-2">from</span>
                                    <span className="text-green-400 ml-2">'@xovato/team'</span>;
                                </div>
                                <div className="flex">
                                    <span className="w-6 text-gray-600">2</span>
                                    <span className="text-purple-400">const</span>
                                    <span className="text-yellow-200 ml-2">project</span>
                                    <span className="text-white ml-2">=</span>
                                    <span className="text-blue-400 ml-2">new</span>
                                    <span className="text-white ml-2">Solution({`{`}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-6 text-gray-600">3</span>
                                    <span className="text-teal-300 ml-6">developers:</span>
                                    <span className="text-orange-300 ml-2">30+</span>,
                                </div>
                                <div className="flex">
                                    <span className="w-6 text-gray-600">4</span>
                                    <span className="text-teal-300 ml-6">experience:</span>
                                    <span className="text-orange-300 ml-2">10.5</span>,
                                </div>
                                <div className="flex">
                                    <span className="w-6 text-gray-600">5</span>
                                    <span className="text-teal-300 ml-6">aiEnabled:</span>
                                    <span className="text-blue-400 ml-2">true</span>
                                </div>
                                <div className="flex">
                                    <span className="w-6 text-gray-600">6</span>
                                    <span className="text-white ml-2">{`});`}</span>
                                </div>
                                <div className="flex mt-4">
                                    <span className="w-6 text-gray-600">7</span>
                                    <span className="text-gray-400 ml-2">// Output: Success</span>
                                </div>
                            </div>
                        </div>

                        {/* Glow behind code block */}
                        <div className="absolute -inset-4 bg-emerald-500/10 blur-xl -z-10 rounded-3xl" />
                    </motion.div>
                </div>
            </section>

            {/* --- Call to Action --- */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-900/40 to-black border border-emerald-500/30 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                        Ready to elevate your digital presence?
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto relative z-10">
                        Join the list of premium clients trusting Xovato's experienced developers and AI-driven workflows.
                    </p>
                    <a href="/contact" className="relative z-10 px-10 py-4 bg-white text-emerald-950 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl inline-block">
                        Let's Talk Business
                    </a>
                </div>
            </section>
        </main>
    );
}

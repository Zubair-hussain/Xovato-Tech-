"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

/* ───────────────── TYPES ───────────────── */
type ProjectStatus = "pending" | "contacted" | "closed";
type ReviewStatus = "pending" | "approved" | "hidden" | "removed";

type ProjectRow = {
  id: string;
  source_id?: string;
  client_name?: string;
  client_email?: string;
  project_types?: string[];
  ai_estimated_cost_usd?: number;
  client_currency?: string;
  details?: string;
  status: ProjectStatus;
  created_at: string;
};

type ReviewRow = {
  id: string;
  country_code: string;
  category: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  created_at: string;
  display_name?: string | null;
  reviewer_email?: string | null;
};

/* ───────────────── MAIN ───────────────── */
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"projects" | "reviews">("projects");

  const load = async () => {
    setLoading(true);
    try {
      // 1. Fetch Projects
      const projectsRes = await supabase
        .from("project_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsRes.error) console.error("Projects Error:", projectsRes.error);
      if (projectsRes.data) setProjects(projectsRes.data as ProjectRow[]);

      // 2. Fetch Reviews
      const reviewsRes = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsRes.error) console.error("Reviews Error:", reviewsRes.error);
      if (reviewsRes.data) setReviews(reviewsRes.data as ReviewRow[]);

    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    load();
  }, []);

  const updateProjectStatus = async (id: string, status: ProjectStatus) => {
    await supabase.from("project_inquiries").update({ status }).eq("id", id);
    load();
  };

  const updateReviewStatus = async (id: string, status: ReviewStatus) => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    load();
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isSupabaseConfigValid =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co") &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {!isSupabaseConfigValid && (
          <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-red-200">
            <h2 className="text-xl font-bold mb-2">⚠️ Supabase Config Error</h2>
            <p className="text-sm opacity-80">Check your .env.local keys.</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex bg-zinc-900 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setTab("projects")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === "projects" ? "bg-emerald-600 text-white shadow-lg" : "text-white/50 hover:text-white"
                  }`}
              >
                Inquiries ({projects.length})
              </button>
              <button
                onClick={() => setTab("reviews")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === "reviews" ? "bg-emerald-600 text-white shadow-lg" : "text-white/50 hover:text-white"
                  }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>
          <button
            onClick={load}
            className="rounded-full bg-zinc-900 border border-white/10 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {loading && <div className="text-center py-20 text-white/50">Accessing secure database...</div>}

        {/* ────────────── PROJECTS TAB ────────────── */}
        {tab === "projects" && !loading && (
          <div className="grid gap-6">
            {projects.length === 0 && <div className="text-center py-20 text-white/30">No project inquiries found.</div>}
            {projects.map((r) => (
              <div key={r.id} className="group relative rounded-[32px] bg-zinc-950/50 border border-white/10 p-8 hover:border-emerald-500/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black tracking-tight">{r.client_name || "Unknown Identity"}</h3>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        {r.source_id?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-white/40">
                      {r.client_email} • {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) => updateProjectStatus(r.id, e.target.value as ProjectStatus)}
                    className="appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase cursor-pointer hover:bg-zinc-800"
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="closed">🟢 Closed</option>
                  </select>
                </div>
                <div className="text-sm text-white/70 bg-black/40 p-4 rounded-xl whitespace-pre-wrap italic border border-white/5">
                  {r.details || "No details provided."}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ────────────── REVIEWS TAB ────────────── */}
        {tab === "reviews" && !loading && (
          <div className="grid gap-6">
            {reviews.length === 0 && <div className="text-center py-20 text-white/30">No reviews found.</div>}
            {reviews.map((rev) => (
              <div key={rev.id} className="group relative rounded-[32px] bg-zinc-950/50 border border-white/10 p-8 hover:border-blue-500/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{rev.title || "Untitled Review"}</h3>
                      <div className="flex text-yellow-400 text-sm">{"★".repeat(Math.round(rev.rating))}</div>
                    </div>
                    <div className="text-sm text-white/50">
                      by <span className="text-white">{rev.display_name || "Guest"}</span> ({rev.reviewer_email}) • {rev.country_code}
                    </div>
                  </div>
                  <select
                    value={rev.status}
                    onChange={(e) => updateReviewStatus(rev.id, e.target.value as ReviewStatus)}
                    className={`appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase cursor-pointer hover:bg-zinc-800 ${rev.status === 'approved' ? 'text-emerald-400 border-emerald-500/30' :
                        rev.status === 'pending' ? 'text-yellow-400 border-yellow-500/30' : 'text-white/50'
                      }`}
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="approved">🟢 Approved</option>
                    <option value="hidden">⚫ Hidden</option>
                    <option value="removed">🔴 Removed</option>
                  </select>
                </div>
                <div className="text-sm text-white/80 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                  "{rev.comment}"
                </div>
                <div className="mt-2 text-[10px] text-white/20 font-mono">
                  ID: {rev.id} • {new Date(rev.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Lock, Mail, CheckCircle, Clock, Trash2, LogOut } from "lucide-react";

/* ───────────────── TYPES ───────────────── */
type ProjectStatus = "pending" | "sample_approved" | "contacted" | "closed";
type ReviewStatus = "pending" | "approved" | "hidden" | "removed";

interface ProjectRow {
  id: string;
  client_name?: string;
  client_email?: string;
  details?: string;
  status: ProjectStatus;
  created_at: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"projects" | "reviews">("projects");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Email Allowlist from .env
  const ADMIN_EMAIL_ALLOWLIST = process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST?.split(",") || [];

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && ADMIN_EMAIL_ALLOWLIST.includes(user.email || "")) {
      setUser(user);
      setIsAuthorized(true);
      fetchData();
    } else {
      setIsAuthorized(false);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("project_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const updateStatus = async (id: string, status: ProjectStatus) => {
    const { error } = await supabase
      .from("project_inquiries")
      .update({ status })
      .eq("id", id);
    if (!error) fetchData();
  };

  // --- Auth Guard UI ---
  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen bg-[#020604] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Access Restricted</h1>
          <p className="text-gray-400 text-sm">Your email is not on the Xovato Admin Allowlist. Please contact the system architect.</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full py-3 bg-white text-black font-bold rounded-xl"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020604] text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic">XOVATO_HQ</h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1">UPLINK ACTIVE // {user?.email}</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setTab("projects")} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'projects' ? 'bg-emerald-600 shadow-lg shadow-emerald-900/20' : 'text-gray-500'}`}>INQUIRIES</button>
            <button onClick={() => setTab("reviews")} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'reviews' ? 'bg-emerald-600' : 'text-gray-500'}`}>REVIEWS</button>
          </div>

          <button onClick={() => supabase.auth.signOut()} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-red-500/20 transition-all text-gray-400 hover:text-red-500">
            <LogOut size={18} />
          </button>
        </header>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center animate-pulse text-emerald-500 font-mono">SYNCHRONIZING_DATABASE...</div>
        ) : (
          <div className="grid gap-6">
            {projects.map((item) => (
              <div key={item.id} className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 hover:border-emerald-500/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{item.client_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-mono mt-1">
                      <Mail size={14} /> {item.client_email}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <select 
                      value={item.status} 
                      onChange={(e) => updateStatus(item.id, e.target.value as ProjectStatus)}
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase outline-none focus:border-emerald-500"
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="sample_approved">🟢 Approve Sample</option>
                      <option value="contacted">🔵 Contacted</option>
                      <option value="closed">⚪ Closed</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-sm text-gray-400 leading-relaxed italic">
                  "{item.details}"
                </div>

                <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                  <span>Received: {new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-4">
                    <button className="hover:text-emerald-500 transition-colors">Generate Invoice</button>
                    <button className="hover:text-red-500 transition-colors">Archive</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
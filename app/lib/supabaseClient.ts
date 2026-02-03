"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ✅ Get env vars (use ! for non-null assertion after check)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env vars missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  );
}

// ✅ Singleton Supabase client (good practice)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ✅ Utility to fetch inquiries (returns consistent shape)
export async function fetchProjectInquiries() {
  const { data, error, status, statusText } = await supabase
    .from("project_inquiries") // Confirm table exists in public schema
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetchProjectInquiries ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
      statusText,
    });
    return { data: null, error };
  }

  return { data, error: null };
}
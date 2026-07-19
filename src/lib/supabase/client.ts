"use client";

// Browser-Client (Client Components). Gibt null zurück, wenn Supabase nicht
// konfiguriert ist (Demo-Modus) — Aufrufer müssen das behandeln.
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

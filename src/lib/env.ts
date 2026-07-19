// =============================================================================
// Zentrale Env-/Modus-Erkennung.
// Wenn keine Supabase-Konfiguration vorhanden ist (oder DEMO_MODE=true),
// läuft die App mit Fixture-Daten — praktisch für Sales-Demos ohne Backend.
// =============================================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY,
);

/**
 * DEMO_MODE ist aktiv, wenn explizit gesetzt ODER wenn Supabase nicht
 * konfiguriert ist. In diesem Modus liefert die Data-Schicht Fixture-Daten.
 */
export const isDemoMode =
  process.env.DEMO_MODE === "true" || !isSupabaseConfigured;

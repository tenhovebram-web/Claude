import "server-only";

// Server-Client (Server Components, Route Handlers, Server Actions).
// Nutzt das Next.js cookie store für Session-Handling gemäß @supabase/ssr.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // In reinen Server Components kann set fehlschlagen — die Session
          // wird dann durch die Middleware aufgefrischt. Bewusst ignoriert.
        }
      },
    },
  });
}

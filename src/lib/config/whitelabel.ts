// =============================================================================
// White-Label-Konfiguration.
// Branding kommt pro Workspace aus der DB (workspaces.branding). Hier liegen
// die Defaults + Helfer, um daraus CSS-Variablen für den BrandProvider zu bauen.
// =============================================================================

import type { Branding } from "@/lib/types/database";

export const DEFAULT_BRANDING: Required<
  Pick<Branding, "primary_color" | "company" | "locale">
> = {
  primary_color: "#0d9488", // teal-600 — neutraler Default
  company: "SMB Automation Hub",
  locale: "de-DE",
};

/** "#0d9488" -> "13 148 136" (für `rgb(var(--brand-rgb) / <alpha>)`). */
export function hexToRgbTriple(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int) || full.length !== 6) return "13 148 136";
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}

/** Wählt lesbare Vordergrundfarbe (schwarz/weiß) für eine Markenfarbe. */
export function foregroundFor(hex: string): string {
  const [r, g, b] = hexToRgbTriple(hex).split(" ").map(Number);
  // relative Luminanz (vereinfacht)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "17 24 39" : "255 255 255";
}

export interface BrandVars {
  "--brand-rgb": string;
  "--brand-fg-rgb": string;
}

export function brandCssVars(branding: Branding): BrandVars {
  const primary = branding.primary_color || DEFAULT_BRANDING.primary_color;
  return {
    "--brand-rgb": hexToRgbTriple(primary),
    "--brand-fg-rgb": foregroundFor(primary),
  };
}

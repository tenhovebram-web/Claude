// Setzt die Marken-CSS-Variablen für den White-Label-Look. Server-Component-
// tauglich (rendert nur ein <div> mit inline style) — kein Client-State nötig.
import type { CSSProperties, ReactNode } from "react";
import type { Branding } from "@/lib/types/database";
import { brandCssVars } from "@/lib/config/whitelabel";

export function BrandProvider({
  branding,
  children,
}: {
  branding: Branding;
  children: ReactNode;
}) {
  const vars = brandCssVars(branding) as unknown as CSSProperties;
  return (
    <div style={vars} className="min-h-screen">
      {children}
    </div>
  );
}

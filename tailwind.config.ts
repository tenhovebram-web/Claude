import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // White-Label: Diese CSS-Variablen werden pro Workspace zur Laufzeit
        // gesetzt (siehe src/lib/config/whitelabel.ts + BrandProvider).
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          fg: "rgb(var(--brand-fg-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

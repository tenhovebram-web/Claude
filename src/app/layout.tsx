import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automations-Dashboard",
  description:
    "White-Label-Dashboard für kleine Dienstleistungsbetriebe — Anrufe, Leads, Termine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

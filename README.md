# SMB-Automation-Hub

White-Label-Automations-Dashboard für kleine Dienstleistungsbetriebe im
DACH-Raum (Handwerk, Immobilienmakler, Praxen). **Ein Deployment, viele
Kunden-Workspaces** — pro Kunde konfiguriert, nicht neu gebaut.

## Kernmodule
1. **Anruf-Cockpit** — verpasste Anrufe & Rückrufliste (vorbereitet für CTI).
2. **Lead- & Angebots-Pipeline** — Kanban mit automatischen Nachfass-Erinnerungen.
3. **Termin-Zentrale** — No-Show-Tracking & Erinnerungs-Hooks.

Herleitung der Module: [`docs/PAIN_POINTS.md`](./docs/PAIN_POINTS.md).

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (PostgreSQL, Auth,
RLS, EU/Frankfurt) · Vercel. Mandantenfähig mit strikter RLS-Datentrennung.

## Schnellstart (Demo, ohne Backend)
```bash
npm install
npm run dev      # http://localhost:3000 — läuft mit Beispieldaten
```
Ohne Supabase-Konfiguration startet die App automatisch im **Demo-Modus**.

## Dokumentation
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Aufbau, Multi-Tenancy, Integrations-Framework
- [`docs/SETUP.md`](./docs/SETUP.md) — Supabase-Einrichtung, neuer Kunde, Deployment
- [`docs/PAIN_POINTS.md`](./docs/PAIN_POINTS.md) — Problemvalidierung (Phase 1)

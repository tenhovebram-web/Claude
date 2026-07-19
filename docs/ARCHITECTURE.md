# ARCHITECTURE.md — SMB-Automation-Hub

White-Label-Automations-Dashboard für kleine Dienstleistungsbetriebe (DACH).
**Ein Deployment, viele Kunden-Workspaces** (mandantenfähig), strikte
Datentrennung per Supabase Row Level Security.

Die inhaltliche Herleitung der drei Kernmodule steht in
[`PAIN_POINTS.md`](./PAIN_POINTS.md).

---

## 1. Tech-Stack

| Ebene | Technologie |
|---|---|
| Frontend/Server | Next.js 14 (App Router), TypeScript, React 18 |
| Styling | Tailwind CSS (White-Label via CSS-Variablen) |
| Datenbank/Auth | Supabase (PostgreSQL, Auth, RLS) — Region **EU/Frankfurt** (DSGVO) |
| Deployment | Vercel |

---

## 2. Mandantenfähigkeit (Multi-Tenant)

- Jede fachliche Tabelle trägt eine `workspace_id`.
- `workspace_members (workspace_id, user_id, role)` verknüpft User mit Tenants.
- **RLS** ist die einzige Autorisierungsgrenze: Jede Policy prüft über die
  Security-Definer-Funktion `is_workspace_member(workspace_id)` (bzw.
  `is_workspace_admin`), ob der eingeloggte User zum Workspace der Zeile gehört.
- Die App liest **nie** direkt mit Service-Role am Client — nur der
  RLS-geschützte Anon/Auth-Client wird verwendet.

Schema + Policies: [`supabase/migrations`](../supabase/migrations).

---

## 3. Kernmodule

| Modul | Route | Tabellen | Pain-Point |
|---|---|---|---|
| **Anruf-Cockpit** | `/dashboard/calls` | `calls` | B1 verpasste Anrufe |
| **Lead- & Angebots-Pipeline** | `/dashboard/pipeline` | `leads` | B2 Speed-to-Lead + B3 Nachfassen |
| **Termin-Zentrale** | `/dashboard/appointments` | `appointments` | B4 No-Shows + B5 Terminkoordination |

Module sind pro Workspace über `workspaces.enabled_modules` (jsonb) ein-/
ausschaltbar; die Sidebar blendet inaktive Module aus.

---

## 4. Verzeichnisstruktur

```
src/
  app/
    layout.tsx                      Root-Layout
    page.tsx                        -> redirect /dashboard
    login/                          Auth (Supabase) bzw. Demo-Hinweis
    dashboard/
      layout.tsx                    Shell: BrandProvider + Sidebar + Topbar
      page.tsx                      Übersicht (Cross-Modul-KPIs)
      calls/ pipeline/ appointments/ settings/
      actions.ts                    Server Actions (RLS-geschützte Mutationen)
    api/webhooks/telephony/[provider]/  CTI-Webhook-Eingang
  components/                       UI + modulspezifische Client-Komponenten
  integrations/                     Adapter-Framework (s. u.)
  lib/
    supabase/                       client / server / middleware (@supabase/ssr)
    data/                           Data-Access-Schicht (Demo vs. Supabase)
    types/database.ts               DB-Typen (Single Source of Truth)
    config/whitelabel.ts            Branding -> CSS-Variablen
    metrics.ts  format.ts  env.ts
supabase/migrations/                Schema, RLS, Seed
```

---

## 5. Data-Access-Schicht & Demo-Modus

Alle Server Components lesen **ausschließlich** über `src/lib/data`. Diese
Schicht entscheidet zentral:

- **Supabase konfiguriert** → Abfragen über den RLS-geschützten Server-Client.
- **Nicht konfiguriert (oder `DEMO_MODE=true`)** → Fixture-Daten aus
  `src/lib/data/fixtures.ts`.

Vorteil: Die App ist **ohne Backend voll lauffähig und demonstrierbar** (ideal
für Sales-Termine), und der Rest der App ist vom Backend entkoppelt.

---

## 6. Integrations-Framework (`src/integrations`)

Keine hart verdrahteten Provider — austauschbare **Adapter** hinter einem
einheitlichen Interface (`connect`, `disconnect`, `healthCheck`) plus
kind-spezifischen Methoden:

| Kind | Interface | Methoden | Referenz-Adapter |
|---|---|---|---|
| `telephony` | `TelephonyAdapter` | `listRecentCalls`, `parseWebhook` | `telephony/mock.ts` |
| `messaging` | `MessagingAdapter` | `send` | `messaging/mock.ts` |
| `calendar` | `CalendarAdapter` | `listEvents`, `createEvent` | `calendar/mock.ts` |

- Adapter registrieren sich in der **Registry** unter `(kind, provider)`.
- Pro Workspace liegen Provider-Wahl + Secrets in der Tabelle `integrations`.
- Adapter **werfen nicht**, sie geben ein `Result<T>` zurück.
- Einen neuen Provider anbinden = neuen Adapter schreiben + in
  `initIntegrations()` registrieren. Der Rest der App bleibt unverändert.

Der Route-Handler `api/webhooks/telephony/[provider]` zeigt den Fluss:
Provider-Payload → `adapter.parseWebhook` → normalisierter `Call`.

---

## 7. White-Label

- Branding pro Workspace in `workspaces.branding` (jsonb: Firma, Markenfarbe,
  Logo, Support-Mail, Locale).
- `BrandProvider` setzt daraus CSS-Variablen (`--brand-rgb`, `--brand-fg-rgb`);
  Tailwind nutzt sie über die `brand`-Farbe. Ein Kunde = eine Zeile Konfiguration,
  kein Rebuild.

---

## 8. Sicherheit & DSGVO (Kurzform)

- Supabase-Projekt zwingend in **EU/Frankfurt**.
- `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig (Cron/Edge-Funktionen), nie am Client.
- RLS auf **allen** fachlichen Tabellen aktiv; Integrationen (Secrets) nur owner/admin.
- Vor Produktion: `supabase get_advisors` (Security/Performance) prüfen; SMS/
  E-Mail-Erinnerungen nur mit dokumentierter Einwilligung versenden.

Details zur Einrichtung: [`SETUP.md`](./SETUP.md).

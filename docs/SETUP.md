# SETUP.md — Einrichtung & Deployment

## Voraussetzungen
- Node.js ≥ 20
- Supabase-Konto (für Produktion)
- Vercel-Konto (für Deployment)

---

## 1. Lokal starten — Demo-Modus (ohne Backend)

Ideal für Sales-Demos: Die App läuft mit Beispieldaten, ganz ohne Supabase.

```bash
npm install
npm run dev
# -> http://localhost:3000  (DEMO_MODE ist automatisch aktiv,
#    solange keine Supabase-Variablen gesetzt sind)
```

---

## 2. Supabase einrichten (Produktion / echter Kunde)

1. **Projekt anlegen** — Region unbedingt **EU (Frankfurt)** wählen (DSGVO).
2. **Migrationen einspielen** (in Reihenfolge). Entweder im Supabase SQL-Editor
   den Inhalt der Dateien ausführen, oder per Supabase CLI:
   ```bash
   # SQL-Editor: nacheinander einfügen & ausführen
   supabase/migrations/0001_init_multitenant.sql
   supabase/migrations/0002_rls_policies.sql
   supabase/migrations/0003_seed_demo.sql   # optional, nur für Demodaten
   ```
   > Alternativ über den Supabase-MCP-Connector: `apply_migration` je Datei.
3. **Keys kopieren** — Project Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (nur serverseitig!)
4. **.env.local anlegen** (siehe `.env.example`) und Werte eintragen.
5. **Ersten User + Workspace verknüpfen:** Nach der Registrierung (Supabase Auth)
   den User zum Workspace hinzufügen:
   ```sql
   insert into public.workspace_members (workspace_id, user_id, role)
   values ('00000000-0000-0000-0000-0000000000d0', '<auth-user-id>', 'owner');
   ```
   (bei eingespieltem Seed; sonst zuerst einen eigenen Workspace anlegen).

Sobald die Supabase-Variablen gesetzt sind, verlässt die App automatisch den
Demo-Modus und liest RLS-geschützt aus der Datenbank.

---

## 3. Neuen Kunden (Workspace) anlegen — White-Label

```sql
insert into public.workspaces (name, slug, branding, enabled_modules)
values (
  'Beispiel Betrieb GmbH',
  'beispiel-betrieb',
  '{"primary_color":"#2563eb","company":"Beispiel Betrieb GmbH","support_email":"info@beispiel.de","locale":"de-DE"}',
  '{"calls": true, "pipeline": true, "appointments": false}'  -- Module je Kunde
);
```
- `branding.primary_color` steuert den gesamten Look (CSS-Variablen).
- `enabled_modules` schaltet Module pro Kunde frei.
- Kein Rebuild nötig — Konfiguration statt Code.

---

## 4. Integrationen anbinden

Referenz-(Mock-)Adapter sind aktiv (Telefonie/Messaging/Kalender). Für echte
Provider:
1. Adapter unter `src/integrations/<kind>/<provider>.ts` implementieren
   (Interface aus `src/integrations/types.ts`).
2. In `src/integrations/index.ts` → `initIntegrations()` registrieren.
3. Pro Workspace konfigurieren:
   ```sql
   insert into public.integrations (workspace_id, kind, provider, config, enabled)
   values ('<ws-id>', 'telephony', 'placetel',
           '{"api_key":"…","webhook_secret":"…"}', true);
   ```
4. CTI-Webhook des Providers auf
   `POST /api/webhooks/telephony/<provider>` zeigen lassen.

---

## 5. Deployment auf Vercel

1. Repo mit Vercel verbinden (Framework: Next.js — Auto-Detect).
2. Environment Variables setzen (dieselben wie in `.env.example`).
3. Deploy. Für periodische Aufgaben (Nachfass-/Termin-Erinnerungen) einen
   **Vercel Cron** oder eine **Supabase Edge Function** einrichten, die über das
   Integrations-Framework (Messaging-Adapter) Erinnerungen versendet.

---

## 6. Nützliche Skripte

```bash
npm run dev        # Entwicklung
npm run build      # Produktions-Build
npm run start      # Produktions-Server
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

---

## 7. Checkliste vor Go-Live pro Kunde

- [ ] Supabase-Projekt in EU/Frankfurt, Migrationen eingespielt.
- [ ] `get_advisors` (Security + Performance) ohne offene Findings.
- [ ] Workspace + Branding + `enabled_modules` konfiguriert.
- [ ] Owner-/Team-User angelegt und verknüpft.
- [ ] Integrationen (CTI/Messaging/Kalender) getestet, Secrets sicher abgelegt.
- [ ] Einwilligung für SMS/E-Mail-Erinnerungen dokumentiert (DSGVO).
- [ ] Seed-Demodaten aus Produktion entfernt.

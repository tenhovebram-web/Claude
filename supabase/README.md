# Supabase — Datenbank

Migrationen in Reihenfolge einspielen (SQL-Editor oder `supabase db push` /
MCP `apply_migration`):

| Datei | Inhalt |
|---|---|
| `0001_init_multitenant.sql` | Schema: workspaces, members, contacts, calls, leads, appointments, integrations + Trigger |
| `0002_rls_policies.sql` | Row Level Security (Datentrennung je Workspace) |
| `0003_seed_demo.sql` | **Optional** — Beispiel-Workspace „Muster Handwerk GmbH" mit Demodaten |

**Region:** Projekt in EU/Frankfurt anlegen (DSGVO).

**Typen regenerieren** (nach Schema-Änderungen):
```bash
supabase gen types typescript --project-id <ref> > src/lib/types/database.gen.ts
```
Aktuell werden die handgepflegten Typen in `src/lib/types/database.ts` genutzt.

Vor Produktion: Seed-Daten entfernen und `get_advisors` (Security/Performance)
prüfen.

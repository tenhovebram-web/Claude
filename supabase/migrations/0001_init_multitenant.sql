-- =============================================================================
-- 0001_init_multitenant.sql
-- SMB-Automation-Hub — Mandantenfähiges Grundschema
--
-- Zentrale Idee: EIN Deployment, viele Kunden-Workspaces (Tenants).
-- Jede fachliche Zeile trägt eine `workspace_id`. Die Datentrennung erfolgt
-- strikt über Row Level Security (siehe 0002_rls_policies.sql).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Profile: 1:1 zu auth.users. Wird per Trigger bei Registrierung angelegt.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Workspaces = Tenants (ein Kunde der Agentur). Enthält White-Label-Branding.
-- -----------------------------------------------------------------------------
create table if not exists public.workspaces (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  -- Branding für White-Label. Struktur bewusst als jsonb, damit neue
  -- Felder ohne Migration ergänzt werden können.
  -- { "primary_color": "#0d9488", "logo_url": "...", "company": "...",
  --   "support_email": "...", "locale": "de-DE" }
  branding       jsonb not null default '{}'::jsonb,
  -- Aktive Module pro Kunde: { "calls": true, "pipeline": true, "appointments": true }
  enabled_modules jsonb not null default
    '{"calls": true, "pipeline": true, "appointments": true}'::jsonb,
  created_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Mitgliedschaft: welcher User gehört zu welchem Workspace (n:m) + Rolle.
-- Diese Tabelle ist die Grundlage aller RLS-Prüfungen.
-- -----------------------------------------------------------------------------
create type public.workspace_role as enum ('owner', 'admin', 'member');

create table if not exists public.workspace_members (
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  role          public.workspace_role not null default 'member',
  created_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists idx_members_user on public.workspace_members (user_id);

-- -----------------------------------------------------------------------------
-- Kontakte: zentrale Kundendatensätze (gegen Doppelerfassung — B6).
-- -----------------------------------------------------------------------------
create table if not exists public.contacts (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  name          text not null,
  phone         text,
  email         text,
  company       text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_contacts_ws on public.contacts (workspace_id);

-- -----------------------------------------------------------------------------
-- MODUL 1 — Anruf-Cockpit (B1): eingehende/verpasste Anrufe, Rückrufliste.
-- Vorbereitet für CTI-Anbindung: `external_id` + `provider` referenzieren
-- den Telefonie-Adapter.
-- -----------------------------------------------------------------------------
create type public.call_direction as enum ('inbound', 'outbound');
create type public.call_status as enum ('answered', 'missed', 'voicemail');

create table if not exists public.calls (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces (id) on delete cascade,
  contact_id        uuid references public.contacts (id) on delete set null,
  direction         public.call_direction not null default 'inbound',
  status            public.call_status not null,
  phone_number      text,
  caller_name       text,
  notes             text,
  callback_required boolean not null default false,
  callback_done     boolean not null default false,
  provider          text,          -- z. B. 'placetel', 'sipgate', 'mock'
  external_id       text,          -- ID beim Telefonie-Provider (Idempotenz)
  occurred_at       timestamptz not null default now(),
  created_at        timestamptz not null default now()
);
create index if not exists idx_calls_ws_time on public.calls (workspace_id, occurred_at desc);
create index if not exists idx_calls_callback
  on public.calls (workspace_id)
  where callback_required and not callback_done;
create unique index if not exists uq_calls_provider_ext
  on public.calls (provider, external_id)
  where external_id is not null;

-- -----------------------------------------------------------------------------
-- MODUL 2 — Lead- & Angebots-Pipeline (B2 + B3): Kanban + Nachfass-Termine.
-- -----------------------------------------------------------------------------
create type public.lead_stage as enum (
  'new', 'contacted', 'quoted', 'followed_up', 'won', 'lost'
);

create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces (id) on delete cascade,
  contact_id        uuid references public.contacts (id) on delete set null,
  title             text not null,
  stage             public.lead_stage not null default 'new',
  value_cents       bigint not null default 0,     -- Auftragswert in Cent
  source            text,                          -- z. B. 'phone', 'website', 'immoscout'
  owner_id          uuid references auth.users (id) on delete set null,
  quote_sent_at     timestamptz,                   -- wann ging das Angebot raus (B3)
  next_follow_up_at timestamptz,                   -- geplante Nachfass-Erinnerung
  last_activity_at  timestamptz not null default now(),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_leads_ws_stage on public.leads (workspace_id, stage);
create index if not exists idx_leads_followup
  on public.leads (workspace_id, next_follow_up_at)
  where next_follow_up_at is not null
    and stage not in ('won', 'lost');

-- -----------------------------------------------------------------------------
-- MODUL 3 — Termin-Zentrale (B4 + B5): Termine, No-Show-Tracking, Erinnerungen.
-- -----------------------------------------------------------------------------
create type public.appointment_status as enum (
  'scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'
);

create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces (id) on delete cascade,
  contact_id        uuid references public.contacts (id) on delete set null,
  title             text not null,
  status            public.appointment_status not null default 'scheduled',
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  location          text,
  notes             text,
  reminder_sent_at  timestamptz,                   -- letzte gesendete Erinnerung (B4)
  provider          text,                          -- z. B. 'google', 'outlook', 'mock'
  external_id       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_appts_ws_time on public.appointments (workspace_id, starts_at);
create unique index if not exists uq_appts_provider_ext
  on public.appointments (provider, external_id)
  where external_id is not null;

-- -----------------------------------------------------------------------------
-- Integrationen: pro Workspace konfigurierbare Adapter (Telefonie/Messaging/
-- Kalender). Secrets liegen in `config` (jsonb) — in Produktion via Vault/
-- verschlüsselt ablegen, nie im Klartext an den Client geben.
-- -----------------------------------------------------------------------------
create type public.integration_kind as enum ('telephony', 'messaging', 'calendar');

create table if not exists public.integrations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  kind          public.integration_kind not null,
  provider      text not null,                     -- z. B. 'placetel', 'twilio', 'google'
  config        jsonb not null default '{}'::jsonb,
  enabled       boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (workspace_id, kind, provider)
);
create index if not exists idx_integrations_ws on public.integrations (workspace_id);

-- -----------------------------------------------------------------------------
-- updated_at automatisch pflegen
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_contacts_updated before update on public.contacts
  for each row execute function public.set_updated_at();
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();
create trigger trg_appointments_updated before update on public.appointments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Profil bei Registrierung automatisch anlegen
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

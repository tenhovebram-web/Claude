// =============================================================================
// Demo-Fixtures. Werden im DEMO_MODE (keine Supabase-Konfiguration) von der
// Data-Schicht ausgeliefert, damit die App ohne Backend voll demonstrierbar ist.
// Spiegelt inhaltlich supabase/migrations/0003_seed_demo.sql.
// =============================================================================

import type {
  Appointment,
  Call,
  Contact,
  Lead,
  Workspace,
} from "@/lib/types/database";

const WS = "00000000-0000-0000-0000-0000000000d0";

/** relative Zeit als ISO-String (Minuten/Stunden/Tage von jetzt). */
function ago(opts: { m?: number; h?: number; d?: number }): string {
  const ms =
    (opts.m ?? 0) * 60_000 +
    (opts.h ?? 0) * 3_600_000 +
    (opts.d ?? 0) * 86_400_000;
  return new Date(Date.now() - ms).toISOString();
}
function inFuture(opts: { m?: number; h?: number; d?: number }): string {
  const ms =
    (opts.m ?? 0) * 60_000 +
    (opts.h ?? 0) * 3_600_000 +
    (opts.d ?? 0) * 86_400_000;
  return new Date(Date.now() + ms).toISOString();
}

export const demoWorkspace: Workspace = {
  id: WS,
  name: "Muster Handwerk GmbH",
  slug: "muster-handwerk",
  branding: {
    primary_color: "#0d9488",
    company: "Muster Handwerk GmbH",
    support_email: "buero@muster-handwerk.de",
    locale: "de-DE",
  },
  enabled_modules: { calls: true, pipeline: true, appointments: true },
  created_at: ago({ d: 90 }),
};

export const demoContacts: Contact[] = [
  { id: "c1", workspace_id: WS, name: "Familie Berger", phone: "+49 151 2345678", email: "berger@example.de", company: null, notes: null, created_at: ago({ d: 3 }), updated_at: ago({ d: 3 }) },
  { id: "c2", workspace_id: WS, name: "Sabine Krüger", phone: "+49 170 9876543", email: "s.krueger@example.de", company: null, notes: null, created_at: ago({ d: 5 }), updated_at: ago({ d: 5 }) },
  { id: "c3", workspace_id: WS, name: "Hausverwaltung Nord", phone: "+49 40 111222", email: "info@hv-nord.de", company: "Hausverwaltung Nord GmbH", notes: null, created_at: ago({ d: 20 }), updated_at: ago({ d: 20 }) },
  { id: "c4", workspace_id: WS, name: "Thomas Wagner", phone: "+49 160 5551234", email: "t.wagner@example.de", company: null, notes: null, created_at: ago({ d: 6 }), updated_at: ago({ d: 6 }) },
];

const contactName = (id: string | null) =>
  demoContacts.find((c) => c.id === id)?.name ?? null;

export const demoCalls: Call[] = [
  { id: "call1", workspace_id: WS, contact_id: "c1", direction: "inbound", status: "missed", phone_number: "+49 151 2345678", caller_name: "Familie Berger", notes: null, callback_required: true, callback_done: false, provider: "mock", external_id: null, occurred_at: ago({ m: 35 }), created_at: ago({ m: 35 }) },
  { id: "call2", workspace_id: WS, contact_id: null, direction: "inbound", status: "missed", phone_number: "+49 152 4443322", caller_name: "Unbekannt", notes: null, callback_required: true, callback_done: false, provider: "mock", external_id: null, occurred_at: ago({ h: 2 }), created_at: ago({ h: 2 }) },
  { id: "call3", workspace_id: WS, contact_id: "c2", direction: "inbound", status: "answered", phone_number: "+49 170 9876543", caller_name: "Sabine Krüger", notes: "Rückfrage zur Rechnung", callback_required: false, callback_done: false, provider: "mock", external_id: null, occurred_at: ago({ h: 3 }), created_at: ago({ h: 3 }) },
  { id: "call4", workspace_id: WS, contact_id: "c3", direction: "inbound", status: "voicemail", phone_number: "+49 40 111222", caller_name: "Hausverwaltung Nord", notes: null, callback_required: true, callback_done: true, provider: "mock", external_id: null, occurred_at: ago({ d: 1 }), created_at: ago({ d: 1 }) },
];

export const demoLeads: Lead[] = [
  { id: "l1", workspace_id: WS, contact_id: "c1", title: "Badsanierung EFH", stage: "new", value_cents: 480000, source: "phone", owner_id: null, quote_sent_at: null, next_follow_up_at: null, last_activity_at: ago({ h: 1 }), notes: "Anfrage über verpassten Anruf zurückgeholt", created_at: ago({ h: 1 }), updated_at: ago({ h: 1 }) },
  { id: "l2", workspace_id: WS, contact_id: "c2", title: "Heizungswartung", stage: "contacted", value_cents: 35000, source: "website", owner_id: null, quote_sent_at: null, next_follow_up_at: inFuture({ d: 2 }), last_activity_at: ago({ d: 1 }), notes: null, created_at: ago({ d: 2 }), updated_at: ago({ d: 1 }) },
  { id: "l3", workspace_id: WS, contact_id: "c4", title: "Elektro-Neuinstallation", stage: "quoted", value_cents: 1250000, source: "immoscout", owner_id: null, quote_sent_at: ago({ d: 4 }), next_follow_up_at: ago({ d: 1 }), last_activity_at: ago({ d: 4 }), notes: "Angebot raus, Nachfassen überfällig!", created_at: ago({ d: 6 }), updated_at: ago({ d: 4 }) },
  { id: "l4", workspace_id: WS, contact_id: "c3", title: "Wartungsvertrag Objekt", stage: "followed_up", value_cents: 96000, source: "phone", owner_id: null, quote_sent_at: ago({ d: 9 }), next_follow_up_at: inFuture({ d: 5 }), last_activity_at: ago({ d: 2 }), notes: null, created_at: ago({ d: 12 }), updated_at: ago({ d: 2 }) },
  { id: "l5", workspace_id: WS, contact_id: null, title: "Fenstertausch", stage: "won", value_cents: 720000, source: "website", owner_id: null, quote_sent_at: ago({ d: 20 }), next_follow_up_at: null, last_activity_at: ago({ d: 14 }), notes: null, created_at: ago({ d: 25 }), updated_at: ago({ d: 14 }) },
  { id: "l6", workspace_id: WS, contact_id: null, title: "Gartentor", stage: "lost", value_cents: 180000, source: "phone", owner_id: null, quote_sent_at: ago({ d: 30 }), next_follow_up_at: null, last_activity_at: ago({ d: 22 }), notes: "Kunde hat sich für Wettbewerber entschieden", created_at: ago({ d: 35 }), updated_at: ago({ d: 22 }) },
];

export const demoAppointments: Appointment[] = [
  { id: "a1", workspace_id: WS, contact_id: "c1", title: "Vor-Ort-Aufmaß Bad", status: "confirmed", starts_at: inFuture({ d: 1, h: 9 }), ends_at: inFuture({ d: 1, h: 10 }), location: "Musterstr. 12, Hamburg", notes: null, reminder_sent_at: ago({ h: 2 }), provider: "mock", external_id: null, created_at: ago({ d: 2 }), updated_at: ago({ d: 2 }) },
  { id: "a2", workspace_id: WS, contact_id: "c2", title: "Heizung Beratung", status: "scheduled", starts_at: inFuture({ d: 3, h: 14 }), ends_at: inFuture({ d: 3, h: 15 }), location: "Telefon", notes: null, reminder_sent_at: null, provider: "mock", external_id: null, created_at: ago({ d: 1 }), updated_at: ago({ d: 1 }) },
  { id: "a3", workspace_id: WS, contact_id: "c4", title: "Angebotstermin Elektro", status: "completed", starts_at: ago({ d: 5 }), ends_at: ago({ d: 5 }), location: "Büro", notes: null, reminder_sent_at: ago({ d: 6 }), provider: "mock", external_id: null, created_at: ago({ d: 8 }), updated_at: ago({ d: 5 }) },
  { id: "a4", workspace_id: WS, contact_id: "c3", title: "Objektbegehung", status: "no_show", starts_at: ago({ d: 2 }), ends_at: ago({ d: 2 }), location: "Objekt Nord", notes: null, reminder_sent_at: null, provider: "mock", external_id: null, created_at: ago({ d: 5 }), updated_at: ago({ d: 2 }) },
];

export { contactName };

// =============================================================================
// Integrations-Framework — einheitliches Adapter-Interface.
//
// Ziel: Telefonie (CTI), Messaging (SMS/E-Mail) und Kalender werden NICHT hart
// verdrahtet, sondern über austauschbare Adapter angebunden. Ein neuer Provider
// = eine neue Adapter-Implementierung, der Rest der App bleibt unverändert.
//
// Jeder Adapter implementiert die gemeinsame `Integration`-Basis plus das
// kind-spezifische Interface (Telephony/Messaging/Calendar).
// =============================================================================

import type {
  Appointment,
  Call,
  IntegrationKind,
} from "@/lib/types/database";

/** Ergebnis-Wrapper — Adapter werfen nicht, sie geben Result zurück. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ConnectionContext {
  workspaceId: string;
  /** providerspezifische Konfiguration/Secrets aus integrations.config */
  config: Record<string, unknown>;
}

export interface HealthStatus {
  healthy: boolean;
  message?: string;
  checkedAt: string;
}

/** Gemeinsame Basis aller Adapter. */
export interface Integration {
  readonly kind: IntegrationKind;
  readonly provider: string;

  /** Verbindung herstellen/validieren (API-Key prüfen, Token holen). */
  connect(ctx: ConnectionContext): Promise<Result<void>>;

  /** Verbindung trennen/aufräumen (Webhooks abmelden etc.). */
  disconnect(ctx: ConnectionContext): Promise<Result<void>>;

  /** Erreichbarkeit/Gültigkeit der Konfiguration prüfen. */
  healthCheck(ctx: ConnectionContext): Promise<HealthStatus>;
}

// -----------------------------------------------------------------------------
// Telefonie / CTI  (Modul: Anruf-Cockpit)
// -----------------------------------------------------------------------------
export type NewCall = Omit<
  Call,
  "id" | "created_at" | "workspace_id" | "contact_id"
>;

export interface TelephonyAdapter extends Integration {
  readonly kind: "telephony";
  /** Aktuelle Anrufe vom Provider ziehen (Polling-Fallback). */
  listRecentCalls(ctx: ConnectionContext): Promise<Result<NewCall[]>>;
  /** Eingehenden Provider-Webhook in ein normalisiertes Call-Objekt wandeln. */
  parseWebhook(payload: unknown): Result<NewCall>;
}

// -----------------------------------------------------------------------------
// Messaging  (Termin-Erinnerungen, Nachfass-Nachrichten)
// -----------------------------------------------------------------------------
export type MessageChannel = "sms" | "email";

export interface OutboundMessage {
  channel: MessageChannel;
  to: string;
  subject?: string; // nur E-Mail
  body: string;
}

export interface MessagingAdapter extends Integration {
  readonly kind: "messaging";
  send(
    ctx: ConnectionContext,
    message: OutboundMessage,
  ): Promise<Result<{ messageId: string }>>;
}

// -----------------------------------------------------------------------------
// Kalender  (Termin-Zentrale)
// -----------------------------------------------------------------------------
export type NewAppointment = Omit<
  Appointment,
  "id" | "created_at" | "updated_at" | "workspace_id" | "contact_id"
>;

export interface CalendarAdapter extends Integration {
  readonly kind: "calendar";
  listEvents(
    ctx: ConnectionContext,
    range: { from: string; to: string },
  ): Promise<Result<NewAppointment[]>>;
  createEvent(
    ctx: ConnectionContext,
    event: NewAppointment,
  ): Promise<Result<{ externalId: string }>>;
}

export type AnyAdapter =
  | TelephonyAdapter
  | MessagingAdapter
  | CalendarAdapter;

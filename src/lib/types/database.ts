// =============================================================================
// Handgepflegte DB-Typen (Spiegel von supabase/migrations).
// In Produktion via `supabase gen types typescript` regenerierbar — bis dahin
// ist dies die Single Source of Truth für die App-Typisierung.
// =============================================================================

export type WorkspaceRole = "owner" | "admin" | "member";
export type CallDirection = "inbound" | "outbound";
export type CallStatus = "answered" | "missed" | "voicemail";
export type LeadStage =
  | "new"
  | "contacted"
  | "quoted"
  | "followed_up"
  | "won"
  | "lost";
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";
export type IntegrationKind = "telephony" | "messaging" | "calendar";

export interface Branding {
  primary_color?: string;
  logo_url?: string;
  company?: string;
  support_email?: string;
  locale?: string;
}

export interface EnabledModules {
  calls: boolean;
  pipeline: boolean;
  appointments: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  branding: Branding;
  enabled_modules: EnabledModules;
  created_at: string;
}

export interface Contact {
  id: string;
  workspace_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  direction: CallDirection;
  status: CallStatus;
  phone_number: string | null;
  caller_name: string | null;
  notes: string | null;
  callback_required: boolean;
  callback_done: boolean;
  provider: string | null;
  external_id: string | null;
  occurred_at: string;
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  title: string;
  stage: LeadStage;
  value_cents: number;
  source: string | null;
  owner_id: string | null;
  quote_sent_at: string | null;
  next_follow_up_at: string | null;
  last_activity_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  title: string;
  status: AppointmentStatus;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  notes: string | null;
  reminder_sent_at: string | null;
  provider: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  workspace_id: string;
  kind: IntegrationKind;
  provider: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
}

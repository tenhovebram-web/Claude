import "server-only";

// =============================================================================
// Data-Access-Schicht. Kapselt die Entscheidung "Demo-Fixtures vs. Supabase".
// Alle Server Components lesen ausschließlich über diese Funktionen — nie
// direkt aus Supabase. So bleibt der Rest der App vom Backend entkoppelt.
// =============================================================================

import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Appointment,
  Call,
  Contact,
  Lead,
  Workspace,
} from "@/lib/types/database";
import {
  demoAppointments,
  demoCalls,
  demoContacts,
  demoLeads,
  demoWorkspace,
} from "./fixtures";

/**
 * Ermittelt den aktiven Workspace des eingeloggten Users.
 * Demo: fester Beispiel-Workspace.
 * Supabase: erster Workspace, in dem der User Mitglied ist (RLS-gefiltert).
 * Multi-Workspace-Umschaltung ist als spätere Erweiterung vorgesehen.
 */
export async function getActiveWorkspace(): Promise<Workspace | null> {
  if (isDemoMode) return demoWorkspace;

  const supabase = createClient();
  if (!supabase) return demoWorkspace;

  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Workspace;
}

export async function getCalls(workspaceId: string): Promise<Call[]> {
  if (isDemoMode) return demoCalls;

  const supabase = createClient();
  if (!supabase) return demoCalls;

  const { data } = await supabase
    .from("calls")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("occurred_at", { ascending: false })
    .limit(200);
  return (data as Call[] | null) ?? [];
}

export async function getLeads(workspaceId: string): Promise<Lead[]> {
  if (isDemoMode) return demoLeads;

  const supabase = createClient();
  if (!supabase) return demoLeads;

  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("last_activity_at", { ascending: false })
    .limit(500);
  return (data as Lead[] | null) ?? [];
}

export async function getAppointments(
  workspaceId: string,
): Promise<Appointment[]> {
  if (isDemoMode) return demoAppointments;

  const supabase = createClient();
  if (!supabase) return demoAppointments;

  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("starts_at", { ascending: true })
    .limit(500);
  return (data as Appointment[] | null) ?? [];
}

export async function getContacts(workspaceId: string): Promise<Contact[]> {
  if (isDemoMode) return demoContacts;

  const supabase = createClient();
  if (!supabase) return demoContacts;

  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });
  return (data as Contact[] | null) ?? [];
}

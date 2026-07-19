"use server";

// Server Actions für Mutationen. Im Demo-Modus No-Ops (die Client-Komponenten
// pflegen dann nur ihren lokalen State). Bei konfiguriertem Supabase schreiben
// sie via RLS-geschützten Server-Client.
import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus, LeadStage } from "@/lib/types/database";

export async function toggleCallback(callId: string, done: boolean) {
  if (isDemoMode) return { ok: true as const };
  const supabase = createClient();
  if (!supabase) return { ok: true as const };
  const { error } = await supabase
    .from("calls")
    .update({ callback_done: done })
    .eq("id", callId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/calls");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateLeadStage(leadId: string, stage: LeadStage) {
  if (isDemoMode) return { ok: true as const };
  const supabase = createClient();
  if (!supabase) return { ok: true as const };
  const { error } = await supabase
    .from("leads")
    .update({ stage, last_activity_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function sendAppointmentReminder(appointmentId: string) {
  // Nutzt in Produktion den Messaging-Adapter des Workspaces (SMS/E-Mail).
  // Hier: Zeitstempel setzen; das eigentliche Senden übernimmt ein Cron/
  // Edge-Function-Job über das Integrations-Framework (siehe src/integrations).
  if (isDemoMode) return { ok: true as const };
  const supabase = createClient();
  if (!supabase) return { ok: true as const };
  const { error } = await supabase
    .from("appointments")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/appointments");
  return { ok: true as const };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  if (isDemoMode) return { ok: true as const };
  const supabase = createClient();
  if (!supabase) return { ok: true as const };
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

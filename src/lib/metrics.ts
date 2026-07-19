// Reine KPI-Berechnungen für das Dashboard. Keine I/O, gut testbar.
import type { Appointment, Call, Lead } from "@/lib/types/database";
import { isOverdue } from "@/lib/format";

export function callMetrics(calls: Call[]) {
  const missed = calls.filter((c) => c.status === "missed");
  const openCallbacks = calls.filter(
    (c) => c.callback_required && !c.callback_done,
  );
  return {
    total: calls.length,
    missed: missed.length,
    openCallbacks: openCallbacks.length,
  };
}

export function leadMetrics(leads: Lead[]) {
  const open = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const won = leads.filter((l) => l.stage === "won");
  const lost = leads.filter((l) => l.stage === "lost");
  const overdueFollowUps = open.filter((l) => isOverdue(l.next_follow_up_at));
  const openPipelineValue = open.reduce((sum, l) => sum + l.value_cents, 0);
  const decided = won.length + lost.length;
  const winRate = decided === 0 ? 0 : Math.round((won.length / decided) * 100);
  return {
    open: open.length,
    won: won.length,
    lost: lost.length,
    overdueFollowUps: overdueFollowUps.length,
    openPipelineValue,
    winRate,
  };
}

export function appointmentMetrics(appointments: Appointment[]) {
  const now = Date.now();
  const upcoming = appointments.filter(
    (a) =>
      new Date(a.starts_at).getTime() >= now &&
      a.status !== "cancelled" &&
      a.status !== "completed",
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "no_show",
  );
  const noShows = appointments.filter((a) => a.status === "no_show");
  const noShowRate =
    past.length === 0 ? 0 : Math.round((noShows.length / past.length) * 100);
  return {
    upcoming: upcoming.length,
    noShows: noShows.length,
    noShowRate,
  };
}

"use client";

import { useState, useTransition } from "react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { formatDateTime, relativeTime } from "@/lib/format";
import {
  sendAppointmentReminder,
  updateAppointmentStatus,
} from "@/app/dashboard/actions";
import type { Appointment, AppointmentStatus } from "@/lib/types/database";

const statusMeta: Record<
  AppointmentStatus,
  { label: string; tone: "slate" | "blue" | "emerald" | "red" | "amber" }
> = {
  scheduled: { label: "geplant", tone: "blue" },
  confirmed: { label: "bestätigt", tone: "emerald" },
  completed: { label: "erledigt", tone: "slate" },
  no_show: { label: "No-Show", tone: "red" },
  cancelled: { label: "storniert", tone: "slate" },
};

export function AppointmentsView({
  initialAppointments,
}: {
  initialAppointments: Appointment[];
}) {
  const [items, setItems] = useState(initialAppointments);
  const [, startTransition] = useTransition();

  function setStatus(appt: Appointment, status: AppointmentStatus) {
    const prev = appt.status;
    setItems((list) =>
      list.map((a) => (a.id === appt.id ? { ...a, status } : a)),
    );
    startTransition(async () => {
      const res = await updateAppointmentStatus(appt.id, status);
      if (!res.ok) {
        setItems((list) =>
          list.map((a) => (a.id === appt.id ? { ...a, status: prev } : a)),
        );
      }
    });
  }

  function remind(appt: Appointment) {
    const stamp = new Date().toISOString();
    setItems((list) =>
      list.map((a) =>
        a.id === appt.id ? { ...a, reminder_sent_at: stamp } : a,
      ),
    );
    startTransition(() => {
      void sendAppointmentReminder(appt.id);
    });
  }

  const now = Date.now();
  const upcoming = items
    .filter((a) => new Date(a.starts_at).getTime() >= now)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
  const past = items
    .filter((a) => new Date(a.starts_at).getTime() < now)
    .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Anstehend
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState>Keine anstehenden Termine.</EmptyState>
        ) : (
          <Card>
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => (
                <li key={a.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{a.title}</p>
                        <Badge tone={statusMeta[a.status].tone}>
                          {statusMeta[a.status].label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDateTime(a.starts_at)} ·{" "}
                        {relativeTime(a.starts_at)} · {a.location || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {a.reminder_sent_at
                          ? `Erinnerung gesendet (${relativeTime(a.reminder_sent_at)})`
                          : "Noch keine Erinnerung gesendet"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => remind(a)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Erinnerung senden
                      </button>
                      {a.status !== "confirmed" ? (
                        <button
                          onClick={() => setStatus(a, "confirmed")}
                          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg hover:opacity-90"
                        >
                          Bestätigen
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Vergangen
        </h2>
        {past.length === 0 ? (
          <EmptyState>Noch keine vergangenen Termine.</EmptyState>
        ) : (
          <Card>
            <ul className="divide-y divide-slate-100">
              {past.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{a.title}</p>
                      <Badge tone={statusMeta[a.status].tone}>
                        {statusMeta[a.status].label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDateTime(a.starts_at)} · {a.location || "—"}
                    </p>
                  </div>
                  {a.status !== "completed" && a.status !== "no_show" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStatus(a, "completed")}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        Erledigt
                      </button>
                      <button
                        onClick={() => setStatus(a, "no_show")}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        No-Show
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}

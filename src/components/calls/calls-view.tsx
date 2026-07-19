"use client";

import { useState, useTransition } from "react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { toggleCallback } from "@/app/dashboard/actions";
import type { Call } from "@/lib/types/database";

type Filter = "all" | "missed" | "callbacks";

const statusTone: Record<Call["status"], "amber" | "emerald" | "blue"> = {
  missed: "amber",
  answered: "emerald",
  voicemail: "blue",
};
const statusLabel: Record<Call["status"], string> = {
  missed: "verpasst",
  answered: "angenommen",
  voicemail: "Mailbox",
};

export function CallsView({ initialCalls }: { initialCalls: Call[] }) {
  const [calls, setCalls] = useState(initialCalls);
  const [filter, setFilter] = useState<Filter>("callbacks");
  const [, startTransition] = useTransition();

  const visible = calls.filter((c) => {
    if (filter === "missed") return c.status === "missed";
    if (filter === "callbacks") return c.callback_required && !c.callback_done;
    return true;
  });

  function onToggle(call: Call) {
    const done = !call.callback_done;
    // optimistisch
    setCalls((prev) =>
      prev.map((c) => (c.id === call.id ? { ...c, callback_done: done } : c)),
    );
    startTransition(async () => {
      const res = await toggleCallback(call.id, done);
      if (!res.ok) {
        // rollback
        setCalls((prev) =>
          prev.map((c) =>
            c.id === call.id ? { ...c, callback_done: !done } : c,
          ),
        );
      }
    });
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "callbacks", label: "Rückrufliste" },
    { key: "missed", label: "Verpasst" },
    { key: "all", label: "Alle" },
  ];

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filter === f.key
                ? "bg-brand text-brand-fg"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState>Keine Anrufe in dieser Ansicht.</EmptyState>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {visible.map((call) => (
              <li
                key={call.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-800">
                      {call.caller_name || call.phone_number || "Unbekannt"}
                    </p>
                    <Badge tone={statusTone[call.status]}>
                      {statusLabel[call.status]}
                    </Badge>
                    {call.callback_done ? (
                      <Badge tone="emerald">erledigt</Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {call.phone_number} · {relativeTime(call.occurred_at)}
                    {call.notes ? ` · ${call.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {call.phone_number ? (
                    <a
                      href={`tel:${call.phone_number.replace(/\s/g, "")}`}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Anrufen
                    </a>
                  ) : null}
                  {call.callback_required ? (
                    <button
                      onClick={() => onToggle(call)}
                      className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg hover:opacity-90"
                    >
                      {call.callback_done
                        ? "Wieder öffnen"
                        : "Als erledigt markieren"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

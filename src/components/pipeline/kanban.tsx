"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui";
import { formatEuro, relativeTime, isOverdue } from "@/lib/format";
import { updateLeadStage } from "@/app/dashboard/actions";
import type { Lead, LeadStage } from "@/lib/types/database";

const STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "Neu" },
  { key: "contacted", label: "Kontaktiert" },
  { key: "quoted", label: "Angebot" },
  { key: "followed_up", label: "Nachgefasst" },
  { key: "won", label: "Gewonnen" },
  { key: "lost", label: "Verloren" },
];

const columnTone: Record<LeadStage, string> = {
  new: "border-t-slate-400",
  contacted: "border-t-blue-400",
  quoted: "border-t-amber-400",
  followed_up: "border-t-violet-400",
  won: "border-t-emerald-500",
  lost: "border-t-red-400",
};

export function Kanban({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);
  const [, startTransition] = useTransition();

  function move(leadId: string, stage: LeadStage) {
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.stage === stage) return;
    const prevStage = current.stage;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage } : l)),
    );
    startTransition(async () => {
      const res = await updateLeadStage(leadId, stage);
      if (!res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, stage: prevStage } : l)),
        );
      }
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 thin-scroll">
      {STAGES.map((stage) => {
        const columnLeads = leads.filter((l) => l.stage === stage.key);
        const total = columnLeads.reduce((s, l) => s + l.value_cents, 0);
        return (
          <div
            key={stage.key}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage.key);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
            onDrop={() => {
              if (dragId) move(dragId, stage.key);
              setDragId(null);
              setOverStage(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-xl border border-t-4 bg-slate-100/60 ${
              columnTone[stage.key]
            } ${overStage === stage.key ? "ring-2 ring-brand/40" : ""}`}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">
                {stage.label}
              </span>
              <span className="text-xs text-slate-400">
                {columnLeads.length} · {formatEuro(total)}
              </span>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {columnLeads.map((lead) => {
                const overdue =
                  lead.stage !== "won" &&
                  lead.stage !== "lost" &&
                  isOverdue(lead.next_follow_up_at);
                return (
                  <article
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => setDragId(null)}
                    className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
                      dragId === lead.id ? "opacity-50" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {lead.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatEuro(lead.value_cents)}
                      {lead.source ? ` · ${lead.source}` : ""}
                    </p>
                    {lead.next_follow_up_at &&
                    lead.stage !== "won" &&
                    lead.stage !== "lost" ? (
                      <div className="mt-2">
                        <Badge tone={overdue ? "red" : "slate"}>
                          {overdue ? "überfällig" : "Nachfass"}:{" "}
                          {relativeTime(lead.next_follow_up_at)}
                        </Badge>
                      </div>
                    ) : null}
                    {lead.notes ? (
                      <p className="mt-2 text-xs text-slate-400">{lead.notes}</p>
                    ) : null}
                  </article>
                );
              })}
              {columnLeads.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-slate-300">
                  Karten hierher ziehen
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { PageHeader, StatTile, Card, Badge } from "@/components/ui";
import {
  getActiveWorkspace,
  getCalls,
  getLeads,
  getAppointments,
} from "@/lib/data";
import {
  appointmentMetrics,
  callMetrics,
  leadMetrics,
} from "@/lib/metrics";
import { formatEuro, formatDateTime, relativeTime, isOverdue } from "@/lib/format";

export default async function OverviewPage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) return null;

  const [calls, leads, appointments] = await Promise.all([
    getCalls(workspace.id),
    getLeads(workspace.id),
    getAppointments(workspace.id),
  ]);

  const cm = callMetrics(calls);
  const lm = leadMetrics(leads);
  const am = appointmentMetrics(appointments);

  const overdueLeads = leads
    .filter((l) => l.stage !== "won" && l.stage !== "lost")
    .filter((l) => isOverdue(l.next_follow_up_at));

  const openCallbacks = calls.filter(
    (c) => c.callback_required && !c.callback_done,
  );

  return (
    <div>
      <PageHeader
        title="Übersicht"
        subtitle="Der Umsatz-Trichter auf einen Blick — kein Lead geht mehr verloren."
      />

      {/* Handlungsbedarf zuerst */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Offene Rückrufe"
          value={cm.openCallbacks}
          hint="verpasste Anrufe ohne Rückruf"
          tone={cm.openCallbacks > 0 ? "warning" : "success"}
        />
        <StatTile
          label="Überfällige Nachfass-Termine"
          value={lm.overdueFollowUps}
          hint="Angebote, die nachgefasst werden müssen"
          tone={lm.overdueFollowUps > 0 ? "warning" : "success"}
        />
        <StatTile
          label="Offener Pipeline-Wert"
          value={formatEuro(lm.openPipelineValue)}
          hint={`${lm.open} offene Leads`}
          tone="brand"
        />
        <StatTile
          label="Gewinnquote"
          value={`${lm.winRate}%`}
          hint={`${lm.won} gewonnen / ${lm.lost} verloren`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Rückrufliste */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Rückrufliste</h2>
            <Link href="/dashboard/calls" className="text-sm text-brand hover:underline">
              Alle Anrufe →
            </Link>
          </div>
          {openCallbacks.length === 0 ? (
            <p className="text-sm text-slate-400">Keine offenen Rückrufe. 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {openCallbacks.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {c.caller_name || c.phone_number || "Unbekannt"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {c.phone_number} · {relativeTime(c.occurred_at)}
                    </p>
                  </div>
                  <Badge tone="amber">verpasst</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Überfällige Nachfässe */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              Angebote nachfassen
            </h2>
            <Link href="/dashboard/pipeline" className="text-sm text-brand hover:underline">
              Pipeline →
            </Link>
          </div>
          {overdueLeads.length === 0 ? (
            <p className="text-sm text-slate-400">
              Alles nachgefasst. Sehr gut.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {overdueLeads.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {l.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatEuro(l.value_cents)} · fällig{" "}
                      {l.next_follow_up_at
                        ? relativeTime(l.next_follow_up_at)
                        : "—"}
                    </p>
                  </div>
                  <Badge tone="red">überfällig</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Termin-Kurzblick */}
      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Nächste Termine</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">
              No-Show-Quote: {am.noShowRate}%
            </span>
            <Link href="/dashboard/appointments" className="text-brand hover:underline">
              Termine →
            </Link>
          </div>
        </div>
        {appointments.filter((a) => new Date(a.starts_at) >= new Date())
          .length === 0 ? (
          <p className="text-sm text-slate-400">Keine anstehenden Termine.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {appointments
              .filter((a) => new Date(a.starts_at) >= new Date())
              .slice(0, 5)
              .map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {a.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(a.starts_at)} · {a.location || "—"}
                    </p>
                  </div>
                  <Badge tone={a.status === "confirmed" ? "emerald" : "blue"}>
                    {a.status === "confirmed" ? "bestätigt" : "geplant"}
                  </Badge>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

import { PageHeader, StatTile } from "@/components/ui";
import { CallsView } from "@/components/calls/calls-view";
import { getActiveWorkspace, getCalls } from "@/lib/data";
import { callMetrics } from "@/lib/metrics";

export default async function CallsPage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) return null;

  const calls = await getCalls(workspace.id);
  const cm = callMetrics(calls);

  return (
    <div>
      <PageHeader
        title="Anruf-Cockpit"
        subtitle="Jeder Anruf sichtbar — kein verpasster Auftrag bleibt liegen."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Anrufe gesamt" value={cm.total} />
        <StatTile
          label="Verpasst"
          value={cm.missed}
          tone={cm.missed > 0 ? "warning" : "success"}
        />
        <StatTile
          label="Offene Rückrufe"
          value={cm.openCallbacks}
          tone={cm.openCallbacks > 0 ? "warning" : "success"}
        />
      </div>
      <CallsView initialCalls={calls} />
    </div>
  );
}

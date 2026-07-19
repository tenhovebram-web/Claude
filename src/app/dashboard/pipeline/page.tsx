import { PageHeader, StatTile } from "@/components/ui";
import { Kanban } from "@/components/pipeline/kanban";
import { getActiveWorkspace, getLeads } from "@/lib/data";
import { leadMetrics } from "@/lib/metrics";
import { formatEuro } from "@/lib/format";

export default async function PipelinePage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) return null;

  const leads = await getLeads(workspace.id);
  const lm = leadMetrics(leads);

  return (
    <div>
      <PageHeader
        title="Lead- & Angebots-Pipeline"
        subtitle="Schnell reagieren, konsequent nachfassen, mehr abschließen. Karten per Drag & Drop verschieben."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Offene Leads" value={lm.open} tone="brand" />
        <StatTile label="Pipeline-Wert" value={formatEuro(lm.openPipelineValue)} />
        <StatTile
          label="Überfällige Nachfässe"
          value={lm.overdueFollowUps}
          tone={lm.overdueFollowUps > 0 ? "warning" : "success"}
        />
        <StatTile label="Gewinnquote" value={`${lm.winRate}%`} />
      </div>
      <Kanban initialLeads={leads} />
    </div>
  );
}

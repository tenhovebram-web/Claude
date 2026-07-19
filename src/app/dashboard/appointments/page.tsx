import { PageHeader, StatTile } from "@/components/ui";
import { AppointmentsView } from "@/components/appointments/appointments-view";
import { getActiveWorkspace, getAppointments } from "@/lib/data";
import { appointmentMetrics } from "@/lib/metrics";

export default async function AppointmentsPage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) return null;

  const appointments = await getAppointments(workspace.id);
  const am = appointmentMetrics(appointments);

  return (
    <div>
      <PageHeader
        title="Termin-Zentrale"
        subtitle="Alle Termine an einem Ort — automatische Erinnerungen gegen No-Shows."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Anstehende Termine" value={am.upcoming} tone="brand" />
        <StatTile
          label="No-Shows"
          value={am.noShows}
          tone={am.noShows > 0 ? "warning" : "success"}
        />
        <StatTile
          label="No-Show-Quote"
          value={`${am.noShowRate}%`}
          hint="Anteil an abgeschlossenen Terminen"
        />
      </div>
      <AppointmentsView initialAppointments={appointments} />
    </div>
  );
}

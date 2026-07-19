import { PageHeader, Card, Badge } from "@/components/ui";
import { getActiveWorkspace } from "@/lib/data";
import { initIntegrations, listAdapters } from "@/integrations";
import { isDemoMode } from "@/lib/env";

export default async function SettingsPage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) return null;

  initIntegrations();
  const adapters = listAdapters();

  const modules: { key: keyof typeof workspace.enabled_modules; label: string }[] =
    [
      { key: "calls", label: "Anruf-Cockpit" },
      { key: "pipeline", label: "Lead- & Angebots-Pipeline" },
      { key: "appointments", label: "Termin-Zentrale" },
    ];

  const kindLabel: Record<string, string> = {
    telephony: "Telefonie / CTI",
    messaging: "Messaging (SMS/E-Mail)",
    calendar: "Kalender",
  };

  return (
    <div>
      <PageHeader
        title="Einstellungen"
        subtitle="White-Label-Konfiguration und Integrationen dieses Workspaces."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Branding</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Firma</dt>
              <dd className="font-medium text-slate-800">
                {workspace.branding.company || workspace.name}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Markenfarbe</dt>
              <dd className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-slate-200"
                  style={{
                    backgroundColor:
                      workspace.branding.primary_color || "#0d9488",
                  }}
                />
                <span className="font-mono text-xs text-slate-600">
                  {workspace.branding.primary_color || "#0d9488"}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Support-E-Mail</dt>
              <dd className="font-medium text-slate-800">
                {workspace.branding.support_email || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Sprache</dt>
              <dd className="font-medium text-slate-800">
                {workspace.branding.locale || "de-DE"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Aktive Module</h2>
          <ul className="space-y-2 text-sm">
            {modules.map((m) => (
              <li key={m.key} className="flex items-center justify-between">
                <span className="text-slate-700">{m.label}</span>
                {workspace.enabled_modules[m.key] ? (
                  <Badge tone="emerald">aktiv</Badge>
                ) : (
                  <Badge tone="slate">inaktiv</Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 font-semibold text-slate-800">
            Integrationen (Adapter-Framework)
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            Verfügbare Adapter. Pro Workspace werden Provider + Zugangsdaten in
            der Tabelle <code>integrations</code> konfiguriert. Aktuell sind die
            Referenz-(Mock-)Adapter registriert.
          </p>
          <ul className="divide-y divide-slate-100">
            {adapters.map((a) => (
              <li
                key={`${a.kind}:${a.provider}`}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {kindLabel[a.kind] ?? a.kind}
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {a.provider}
                  </span>
                </div>
                <Badge tone="blue">Referenz-Adapter</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {isDemoMode ? (
        <p className="mt-6 text-xs text-slate-400">
          Hinweis: Im Demo-Modus sind Einstellungen schreibgeschützt. Mit
          konfiguriertem Supabase können owner/admin Branding, Module und
          Integrationen bearbeiten (RLS-geschützt).
        </p>
      ) : null}
    </div>
  );
}

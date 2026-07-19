// =============================================================================
// Eingehender Telefonie-Webhook (CTI-Anbindung, Modul: Anruf-Cockpit).
// Der passende Adapter normalisiert das providerspezifische Payload zu einem
// Call und legt es (mit gültiger Workspace-Zuordnung) in der DB ab.
//
// Sicherheit (Produktion): Signatur/Secret des Providers prüfen und die
// Workspace-Zuordnung serverseitig auflösen (z. B. über gerufene Nummer).
// =============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { initIntegrations, getTelephonyAdapter } from "@/integrations";

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  initIntegrations();
  const adapter = getTelephonyAdapter(params.provider);
  if (!adapter) {
    return NextResponse.json(
      { error: `Kein Telefonie-Adapter für '${params.provider}'` },
      { status: 404 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON" }, { status: 400 });
  }

  const parsed = adapter.parseWebhook(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  // In Produktion: hier den normalisierten Call via Service-Role/RLS in
  // `calls` einfügen (workspace_id aus der Provider-Konfiguration auflösen).
  // Für das Grundgerüst bestätigen wir die Normalisierung.
  return NextResponse.json({ ok: true, call: parsed.data }, { status: 202 });
}

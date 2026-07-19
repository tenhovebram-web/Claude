// Referenz-Telefonie-Adapter (Mock). Dient als Vorlage für echte CTI-Anbieter
// (Placetel, sipgate, 3CX). Zeigt die Vertragsform, ohne externe API.
import type {
  ConnectionContext,
  HealthStatus,
  NewCall,
  Result,
  TelephonyAdapter,
} from "@/integrations/types";

export const mockTelephonyAdapter: TelephonyAdapter = {
  kind: "telephony",
  provider: "mock",

  async connect(): Promise<Result<void>> {
    return { ok: true, data: undefined };
  },
  async disconnect(): Promise<Result<void>> {
    return { ok: true, data: undefined };
  },
  async healthCheck(): Promise<HealthStatus> {
    return { healthy: true, message: "Mock aktiv", checkedAt: new Date().toISOString() };
  },

  async listRecentCalls(_ctx: ConnectionContext): Promise<Result<NewCall[]>> {
    return {
      ok: true,
      data: [
        {
          direction: "inbound",
          status: "missed",
          phone_number: "+49 151 0000000",
          caller_name: "Demo-Anrufer",
          notes: null,
          callback_required: true,
          callback_done: false,
          provider: "mock",
          external_id: `mock-${Date.now()}`,
          occurred_at: new Date().toISOString(),
        },
      ],
    };
  },

  parseWebhook(payload: unknown): Result<NewCall> {
    // Erwartet ein flaches Objekt { from, name, event }.
    if (typeof payload !== "object" || payload === null) {
      return { ok: false, error: "Ungültiges Webhook-Payload" };
    }
    const p = payload as Record<string, unknown>;
    const answered = p.event === "answered";
    return {
      ok: true,
      data: {
        direction: "inbound",
        status: answered ? "answered" : "missed",
        phone_number: typeof p.from === "string" ? p.from : null,
        caller_name: typeof p.name === "string" ? p.name : null,
        notes: null,
        callback_required: !answered,
        callback_done: false,
        provider: "mock",
        external_id: typeof p.id === "string" ? p.id : `mock-${Date.now()}`,
        occurred_at: new Date().toISOString(),
      },
    };
  },
};

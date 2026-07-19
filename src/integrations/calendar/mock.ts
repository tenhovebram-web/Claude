// Referenz-Kalender-Adapter (Mock). Vorlage für Google Calendar, Microsoft 365.
import type {
  CalendarAdapter,
  ConnectionContext,
  HealthStatus,
  NewAppointment,
  Result,
} from "@/integrations/types";

export const mockCalendarAdapter: CalendarAdapter = {
  kind: "calendar",
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

  async listEvents(
    _ctx: ConnectionContext,
    _range: { from: string; to: string },
  ): Promise<Result<NewAppointment[]>> {
    return { ok: true, data: [] };
  },

  async createEvent(
    _ctx: ConnectionContext,
    _event: NewAppointment,
  ): Promise<Result<{ externalId: string }>> {
    return { ok: true, data: { externalId: `mock-${Date.now()}` } };
  },
};

// Referenz-Messaging-Adapter (Mock). Vorlage für Twilio, MessageBird, SMTP.
// "Sendet" indem es auf der Serverkonsole loggt.
import type {
  ConnectionContext,
  HealthStatus,
  MessagingAdapter,
  OutboundMessage,
  Result,
} from "@/integrations/types";

export const mockMessagingAdapter: MessagingAdapter = {
  kind: "messaging",
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

  async send(
    _ctx: ConnectionContext,
    message: OutboundMessage,
  ): Promise<Result<{ messageId: string }>> {
    // eslint-disable-next-line no-console
    console.info(
      `[mock-messaging] ${message.channel} an ${message.to}: ${message.body}`,
    );
    return { ok: true, data: { messageId: `mock-${Date.now()}` } };
  },
};

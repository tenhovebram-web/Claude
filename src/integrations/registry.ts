// =============================================================================
// Adapter-Registry. Adapter registrieren sich unter (kind, provider) und werden
// zur Laufzeit anhand der Workspace-Konfiguration aufgelöst.
// =============================================================================

import type {
  AnyAdapter,
  CalendarAdapter,
  Integration,
  MessagingAdapter,
  TelephonyAdapter,
} from "./types";
import type { IntegrationKind } from "@/lib/types/database";

const registry = new Map<string, AnyAdapter>();

const key = (kind: IntegrationKind, provider: string) => `${kind}:${provider}`;

export function registerAdapter(adapter: AnyAdapter): void {
  registry.set(key(adapter.kind, adapter.provider), adapter);
}

export function getAdapter(
  kind: IntegrationKind,
  provider: string,
): Integration | undefined {
  return registry.get(key(kind, provider));
}

export function getTelephonyAdapter(
  provider: string,
): TelephonyAdapter | undefined {
  return registry.get(key("telephony", provider)) as
    | TelephonyAdapter
    | undefined;
}

export function getMessagingAdapter(
  provider: string,
): MessagingAdapter | undefined {
  return registry.get(key("messaging", provider)) as
    | MessagingAdapter
    | undefined;
}

export function getCalendarAdapter(
  provider: string,
): CalendarAdapter | undefined {
  return registry.get(key("calendar", provider)) as
    | CalendarAdapter
    | undefined;
}

export function listAdapters(): { kind: IntegrationKind; provider: string }[] {
  return Array.from(registry.values()).map((a) => ({
    kind: a.kind,
    provider: a.provider,
  }));
}

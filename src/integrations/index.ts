// =============================================================================
// Integrations-Framework — Einstiegspunkt.
// Registriert die verfügbaren Adapter. Neue Provider hier ergänzen.
// =============================================================================

import { registerAdapter } from "./registry";
import { mockTelephonyAdapter } from "./telephony/mock";
import { mockMessagingAdapter } from "./messaging/mock";
import { mockCalendarAdapter } from "./calendar/mock";

let initialized = false;

export function initIntegrations(): void {
  if (initialized) return;
  registerAdapter(mockTelephonyAdapter);
  registerAdapter(mockMessagingAdapter);
  registerAdapter(mockCalendarAdapter);
  // TODO(Produktion): echte Adapter registrieren, z. B.
  //   registerAdapter(placetelTelephonyAdapter);
  //   registerAdapter(twilioMessagingAdapter);
  //   registerAdapter(googleCalendarAdapter);
  initialized = true;
}

export * from "./types";
export * from "./registry";

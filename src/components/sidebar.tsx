"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EnabledModules } from "@/lib/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  module?: keyof EnabledModules;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Übersicht", icon: "▤" },
  { href: "/dashboard/calls", label: "Anruf-Cockpit", icon: "☎", module: "calls" },
  { href: "/dashboard/pipeline", label: "Lead-Pipeline", icon: "▦", module: "pipeline" },
  { href: "/dashboard/appointments", label: "Termine", icon: "◷", module: "appointments" },
  { href: "/dashboard/settings", label: "Einstellungen", icon: "⚙" },
];

export function Sidebar({
  company,
  enabledModules,
}: {
  company: string;
  enabledModules: EnabledModules;
}) {
  const pathname = usePathname();

  const items = NAV.filter(
    (item) => !item.module || enabledModules[item.module],
  );

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-fg font-bold">
          {company.charAt(0).toUpperCase()}
        </span>
        <span className="truncate text-sm font-semibold text-slate-800">
          {company}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand/10 text-brand"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
        Automations-Hub
      </div>
    </aside>
  );
}

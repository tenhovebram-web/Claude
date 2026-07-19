import { redirect } from "next/navigation";
import { BrandProvider } from "@/components/brand-provider";
import { Sidebar } from "@/components/sidebar";
import { getActiveWorkspace } from "@/lib/data";
import { DEFAULT_BRANDING } from "@/lib/config/whitelabel";
import { isDemoMode } from "@/lib/env";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getActiveWorkspace();

  // Kein Workspace + kein Demo -> zurück zum Login.
  if (!workspace) redirect("/login");

  const company =
    workspace.branding.company || workspace.name || DEFAULT_BRANDING.company;

  return (
    <BrandProvider branding={workspace.branding}>
      <div className="flex min-h-screen">
        <Sidebar
          company={company}
          enabledModules={workspace.enabled_modules}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <span className="text-sm text-slate-500">
              Willkommen zurück
            </span>
            {isDemoMode ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                DEMO-MODUS — Beispieldaten
              </span>
            ) : null}
          </header>
          <main className="min-w-0 flex-1 p-6">{children}</main>
        </div>
      </div>
    </BrandProvider>
  );
}

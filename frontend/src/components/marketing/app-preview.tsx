import { Bell, FileText, Hash, LayoutDashboard, ListChecks } from "lucide-react";

const previewNav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Tasks", icon: ListChecks, active: false },
  { label: "Channels", icon: Hash, active: false },
  { label: "Documents", icon: FileText, active: false },
];

/** Stylised illustration of the Nexora workspace shell used on the landing page. */
export function AppPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-x-10 -top-6 bottom-0 rounded-[2rem] bg-accent/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/50">
        <div className="flex h-9 items-center gap-1.5 border-b border-line px-4">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </div>

        <div className="flex">
          <div className="hidden w-48 shrink-0 border-r border-line p-3 sm:block">
            <div className="mb-4 flex items-center gap-2 px-1">
              <span className="grid size-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-white">
                N
              </span>
              <span className="text-[13px] font-medium">Workspace</span>
            </div>
            <ul className="space-y-1">
              {previewNav.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] ${
                    item.active
                      ? "bg-accent-soft text-ink"
                      : "text-ink-subtle"
                  }`}
                >
                  <item.icon
                    className={`size-3.5 ${item.active ? "text-accent" : ""}`}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 flex-1 p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 rounded-full bg-line-strong" />
              <Bell className="size-4 text-ink-subtle" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((column) => (
                <div
                  key={column}
                  className="rounded-lg border border-line bg-surface-raised p-3"
                >
                  <div className="h-2 w-16 rounded-full bg-line-strong" />
                  <div className="mt-3 space-y-2">
                    {Array.from({ length: 3 - column }).map((_, row) => (
                      <div
                        key={row}
                        className="rounded-md border border-line bg-surface p-2.5"
                      >
                        <div className="h-2 w-full rounded-full bg-line-strong" />
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="size-3 rounded-full bg-accent/60" />
                          <div className="h-1.5 w-10 rounded-full bg-line" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

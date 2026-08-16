import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Projects", href: "#projects" },
      { label: "Tasks", href: "#tasks" },
      { label: "Collaboration", href: "#collaboration" },
      { label: "Documents and files", href: "#knowledge" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Notifications", href: "#notifications" },
      { label: "AI planning", href: "#ai" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-muted">
            Project planning, team collaboration, documentation and files in one
            workspace.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-[13px] font-semibold text-ink">
              {column.title}
            </h3>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-muted">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line/70">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-ink-subtle sm:px-6">
          Nexora — Plan. Collaborate. Build.
        </p>
      </div>
    </footer>
  );
}

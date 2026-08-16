"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { navItems } from "@/lib/nav";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`flex h-full flex-col border-r border-line bg-surface transition-[width] duration-200 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Logo href="/dashboard" showWordmark={!collapsed} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-surface-raised hover:text-ink lg:block"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent-soft text-ink"
                    : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`size-4 shrink-0 ${active ? "text-accent" : ""}`}
                />
                {collapsed ? null : <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

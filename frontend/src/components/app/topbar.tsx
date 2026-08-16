"use client";

import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface TopbarProps {
  title: string;
  onOpenMenu: () => void;
}

export function Topbar({ title, onOpenMenu }: TopbarProps) {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? "")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface/60 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="rounded-md p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="flex-1 truncate text-sm font-medium text-ink">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-[13px] font-medium leading-tight text-ink">
            {user?.name}
          </p>
          <p className="text-xs leading-tight text-ink-subtle">{user?.email}</p>
        </div>
        <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
          {initials || "?"}
        </span>
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          className="rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-surface-raised hover:text-danger"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-surface-raised ${className}`} />
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 px-6 py-14 text-center">
      {icon ? <div className="text-ink-subtle">{icon}</div> : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-md text-sm text-ink-muted">{description}</p>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-ink">Something went wrong</h3>
      <p className="max-w-md text-sm text-ink-muted">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

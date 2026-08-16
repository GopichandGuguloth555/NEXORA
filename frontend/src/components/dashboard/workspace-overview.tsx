"use client";

import { Building2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { CreateWorkspaceForm } from "@/components/dashboard/create-workspace-form";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useAsync } from "@/hooks/use-async";
import { workspaceService } from "@/services/workspace.service";
import type { Workspace } from "@/types/models";
import { useAuth } from "@/providers/auth-provider";

export function WorkspaceOverview() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync<Workspace[]>(() =>
    workspaceService.list(),
  );
  const [creating, setCreating] = useState(false);

  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Your workspaces bring projects, tasks, chat, documents and files
            together.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating((value) => !value)}>
          <Plus className="size-4" />
          New workspace
        </Button>
      </div>

      {creating ? (
        <CreateWorkspaceForm
          onCancel={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            reload();
          }}
        />
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-32" />
          ))}
        </div>
      ) : null}

      {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && data && data.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="No workspaces yet"
          description="Create your first workspace to start planning projects with your team."
          action={
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Create workspace
            </Button>
          }
        />
      ) : null}

      {!loading && !error && data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const memberCount = workspace.members?.length ?? 0;

  return (
    <article className="surface-panel flex h-full flex-col gap-3 p-5 transition-colors hover:border-line-strong">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-sm font-semibold text-accent">
          {workspace.name.charAt(0).toUpperCase()}
        </span>
        <h3 className="truncate text-sm font-semibold text-ink">
          {workspace.name}
        </h3>
      </div>
      <p className="line-clamp-2 flex-1 text-[13px] text-ink-muted">
        {workspace.description ?? "No description yet."}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
        <Users className="size-3.5" />
        {memberCount} {memberCount === 1 ? "member" : "members"}
      </div>
    </article>
  );
}

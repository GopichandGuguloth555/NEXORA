import {
  Bell,
  Files,
  FolderKanban,
  ListChecks,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  visual: ReactNode;
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="surface-panel p-5">{children}</div>;
}

const features: Feature[] = [
  {
    id: "projects",
    eyebrow: "Projects",
    title: "Every project in one place",
    description:
      "Group work into projects inside a workspace, each with its own description, owner and task board.",
    points: [
      "Workspaces with owner, admin and member roles",
      "Create, edit and archive projects",
      "Project detail view with its full task list",
    ],
    visual: (
      <Panel>
        <div className="space-y-2.5">
          {["Website relaunch", "Mobile app", "Design system"].map((name) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface-raised px-3 py-2.5"
            >
              <span className="grid size-7 place-items-center rounded-md bg-accent-soft text-[11px] font-semibold text-accent">
                {name.charAt(0)}
              </span>
              <span className="text-[13px] text-ink">{name}</span>
              <FolderKanban className="ml-auto size-3.5 text-ink-subtle" />
            </div>
          ))}
        </div>
      </Panel>
    ),
  },
  {
    id: "tasks",
    eyebrow: "Tasks",
    title: "Plan the work, then track it",
    description:
      "Tasks carry a status, priority, assignee, due date, description and threaded comments.",
    points: [
      "To do, in progress and done columns",
      "Low, medium and high priority",
      "Assign teammates and set due dates",
    ],
    visual: (
      <Panel>
        <div className="grid grid-cols-3 gap-2.5">
          {["To do", "In progress", "Done"].map((column, index) => (
            <div key={column} className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-ink-subtle">
                {column}
              </p>
              {Array.from({ length: 3 - index }).map((_, row) => (
                <div
                  key={row}
                  className="rounded-md border border-line bg-surface-raised p-2"
                >
                  <div className="h-1.5 w-full rounded-full bg-line-strong" />
                  <div className="mt-2 h-1.5 w-2/3 rounded-full bg-line" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <ListChecks className="mt-4 size-4 text-ink-subtle" />
      </Panel>
    ),
  },
  {
    id: "collaboration",
    eyebrow: "Real-time collaboration",
    title: "Talk where the work happens",
    description:
      "Channels keep conversation next to the projects they belong to, with messages delivered over a live connection.",
    points: [
      "Workspace channels with membership checks",
      "Instant message delivery via Socket.IO",
      "Typing and presence indicators",
    ],
    visual: (
      <Panel>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <MessagesSquare className="size-4 text-accent" />
            #product
          </div>
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-2.5">
              <span className="size-7 shrink-0 rounded-full bg-accent-soft" />
              <div className="flex-1 space-y-1.5 rounded-lg border border-line bg-surface-raised p-2.5">
                <div className="h-1.5 w-20 rounded-full bg-line-strong" />
                <div className="h-1.5 w-full rounded-full bg-line" />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-ink-subtle">Someone is typing…</p>
        </div>
      </Panel>
    ),
  },
  {
    id: "knowledge",
    eyebrow: "Documents and files",
    title: "Keep decisions and assets together",
    description:
      "Write documents in the workspace and attach the files your team needs, stored through the Nexora upload service.",
    points: [
      "Workspace documents with author and timestamps",
      "File uploads with type and size details",
      "Open, download or remove files",
    ],
    visual: (
      <Panel>
        <div className="space-y-2.5">
          {["Product brief", "Launch checklist"].map((title) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-surface-raised p-3"
            >
              <div className="text-[13px] text-ink">{title}</div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-line" />
              <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-line" />
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-[12px] text-ink-subtle">
            <Files className="size-3.5" />
            Drop a file to upload
          </div>
        </div>
      </Panel>
    ),
  },
  {
    id: "notifications",
    eyebrow: "Notifications",
    title: "Know what changed while you were away",
    description:
      "Assignments, updates and mentions land in one place with unread state you can clear as you go.",
    points: [
      "Task, message, document and invite notifications",
      "Unread indicator across the app",
      "Mark as read or dismiss",
    ],
    visual: (
      <Panel>
        <div className="space-y-2.5">
          {[true, false].map((unread, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-raised p-3"
            >
              <Bell
                className={`mt-0.5 size-3.5 ${unread ? "text-accent" : "text-ink-subtle"}`}
              />
              <div className="flex-1 space-y-1.5">
                <div className="h-1.5 w-24 rounded-full bg-line-strong" />
                <div className="h-1.5 w-full rounded-full bg-line" />
              </div>
              {unread ? <span className="size-2 rounded-full bg-accent" /> : null}
            </div>
          ))}
        </div>
      </Panel>
    ),
  },
];

export function FeatureSections() {
  return (
    <>
      {features.map((feature, index) => (
        <section
          key={feature.id}
          id={feature.id}
          className="border-t border-line/70"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              <p className="text-[13px] font-medium text-accent">
                {feature.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {feature.description}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink-muted">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className={index % 2 === 1 ? "lg:order-1" : undefined}>
              {feature.visual}
            </div>
          </div>
        </section>
      ))}

      <section id="ai" className="border-t border-line/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="surface-panel relative overflow-hidden p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3 py-1 text-xs text-ink-muted">
                <Sparkles className="size-3.5 text-accent" />
                On the roadmap
              </p>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                AI project planning
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Describe what you want to build and Nexora will draft the project
                for you — phases, tasks, dependencies, documentation and a
                timeline you can edit before anything is created. This is not
                available yet; the workspace is being built so it can slot in
                without changing how you work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line/70">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bring your team into one workspace
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            Create a workspace, invite your team and start planning in minutes.
          </p>
        </div>
      </section>
    </>
  );
}

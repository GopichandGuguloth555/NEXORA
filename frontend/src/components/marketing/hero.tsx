import { ArrowRight } from "lucide-react";
import { AppPreview } from "@/components/marketing/app-preview";
import { ButtonLink } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(109,92,231,0.22),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-muted">
            One workspace for planning and collaboration
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            Nexora
          </h1>
          <p className="mt-3 bg-gradient-to-r from-ink to-accent bg-clip-text text-2xl font-medium tracking-tight text-transparent sm:text-3xl">
            Plan. Collaborate. Build.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
            Nexora brings projects, tasks, team communication, documents and
            files into a single workspace — so your team stops switching tools
            and starts shipping.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/register" size="lg">
              Get started
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              Sign in
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14">
          <AppPreview />
        </div>
      </div>
    </section>
  );
}

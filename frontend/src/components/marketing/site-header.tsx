import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
          <a href="#projects" className="transition-colors hover:text-ink">
            Projects
          </a>
          <a href="#collaboration" className="transition-colors hover:text-ink">
            Collaboration
          </a>
          <a href="#knowledge" className="transition-colors hover:text-ink">
            Documents
          </a>
          <a href="#ai" className="transition-colors hover:text-ink">
            AI
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Get started
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

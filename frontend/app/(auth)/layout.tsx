import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[url('/auth-workspace.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-canvas/85" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-canvas" />

      <div className="relative w-full max-w-[26rem]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-line bg-surface/90 p-7 shadow-2xl shadow-black/40 backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}

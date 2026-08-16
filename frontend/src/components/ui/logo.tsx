import Link from "next/link";

interface LogoProps {
  href?: string;
  showWordmark?: boolean;
}

export function Logo({ href = "/", showWordmark = true }: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white">
        N
      </span>
      {showWordmark ? (
        <span className="text-[17px] font-semibold tracking-tight text-ink">
          Nexora
        </span>
      ) : null}
    </Link>
  );
}

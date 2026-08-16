import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_6px_20px_-10px_rgba(109,92,231,0.9)]",
  secondary:
    "bg-surface-raised text-ink border border-line hover:border-line-strong",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-raised",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${buttonClasses(variant, size)} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${buttonClasses(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

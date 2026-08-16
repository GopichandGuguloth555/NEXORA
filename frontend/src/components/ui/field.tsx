import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Field({ label, hint, id, className = "", ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-[13px] font-medium text-ink-muted"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none ${className}`}
        {...props}
      />
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
    </div>
  );
}

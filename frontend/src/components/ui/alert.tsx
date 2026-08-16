import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AlertProps {
  tone?: "error" | "success";
  children: React.ReactNode;
}

export function Alert({ tone = "error", children }: AlertProps) {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] ${
        isError
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-positive/40 bg-positive/10 text-positive"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

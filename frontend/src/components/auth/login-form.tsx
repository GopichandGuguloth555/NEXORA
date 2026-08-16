"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { useAuth } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setSubmitting(true);

    try {
      await login({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
      router.replace("/dashboard");
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-ink-muted">
          Sign in to continue to your workspace.
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" loading={submitting}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-muted">
        New to Nexora?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

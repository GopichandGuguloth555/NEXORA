"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { useAuth } from "@/providers/auth-provider";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setSubmitting(true);

    try {
      await register({
        name: String(form.get("name") ?? "").trim(),
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
        <h1 className="text-xl font-semibold tracking-tight">
          Create your workspace
        </h1>
        <p className="text-sm text-ink-muted">
          Start planning projects with your team in minutes.
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          minLength={3}
          maxLength={50}
          required
        />
        <Field
          label="Work email"
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          maxLength={100}
          required
          hint="Minimum 8 characters."
        />
        <Button type="submit" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

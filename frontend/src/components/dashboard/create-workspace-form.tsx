"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { workspaceService } from "@/services/workspace.service";

interface CreateWorkspaceFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateWorkspaceForm({
  onCreated,
  onCancel,
}: CreateWorkspaceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const description = String(form.get("description") ?? "").trim();
    setError(null);
    setSubmitting(true);

    try {
      await workspaceService.create({
        name: String(form.get("name") ?? "").trim(),
        ...(description ? { description } : {}),
      });
      onCreated();
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel space-y-4 p-5">
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Workspace name"
          name="name"
          placeholder="Acme product team"
          minLength={3}
          maxLength={100}
          required
        />
        <Field
          label="Description"
          name="description"
          placeholder="What is this workspace for?"
          maxLength={500}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={submitting}>
          Create workspace
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

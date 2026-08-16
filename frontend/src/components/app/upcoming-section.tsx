import { EmptyState } from "@/components/ui/states";

interface UpcomingSectionProps {
  title: string;
  description: string;
}

/** Placeholder for a navigation area whose backend module is integrated in a later phase. */
export function UpcomingSection({ title, description }: UpcomingSectionProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <EmptyState title={title} description={description} />
    </div>
  );
}

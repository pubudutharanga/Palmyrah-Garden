import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-panel border border-dune bg-dune/45 px-6 py-12 text-center sm:px-10",
        className,
      )}
    >
      <div className="palm-watermark pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="relative mx-auto max-w-md space-y-3">
        <h3 className="h3">{title}</h3>
        <p className="small text-ink/65">{body}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}

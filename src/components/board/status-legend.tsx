"use client";

import { ADMIN_STATUS_ORDER, GUEST_STATUS_ORDER, STATUS_META } from "@/components/board/status-meta";
import { cn } from "@/lib/utils";
import type { RoomBoardState } from "@/lib/prototype/types";

export function StatusLegend({
  counts,
  mode,
  active,
  onChange,
}: {
  counts: Record<RoomBoardState, number>;
  mode: "guest" | "admin";
  active: RoomBoardState | "all";
  onChange: (status: RoomBoardState | "all") => void;
}) {
  const order = mode === "guest" ? GUEST_STATUS_ORDER : ADMIN_STATUS_ORDER;
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter rooms by status">
      {order.map((status) => {
        const meta = STATUS_META[status];
        const count = counts[status];
        const isActive = active === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? "all" : status)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
              isActive
                ? "border-ink bg-ink text-salt"
                : "border-ink/15 bg-salt text-ink hover:border-ink/35",
            )}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} aria-hidden="true" />
            {meta.label}
            <span className="tnum opacity-70">{count}</span>
          </button>
        );
      })}
      {active !== "all" ? (
        <button
          type="button"
          onClick={() => onChange("all")}
          className="min-h-9 rounded-full px-2 text-xs text-ink/55 underline decoration-ink/25 underline-offset-4 hover:text-ink"
        >
          Show all
        </button>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-ink/15 bg-dune text-ink",
  available: "border-frond/30 bg-frond/10 text-frond",
  held: "border-jaggery/40 bg-jaggery/10 text-[#7a5719]",
  booked: "border-booked/35 bg-booked/10 text-blocked",
  blocked: "border-blocked/30 bg-blocked/10 text-blocked",
  danger: "border-danger/30 bg-danger/10 text-danger",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

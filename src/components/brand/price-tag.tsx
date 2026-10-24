import { cn } from "@/lib/utils";
import { formatLKR } from "@/lib/money";

export function PriceTag({
  amount,
  suffix = "per night",
  note = "before taxes",
  inverted = false,
  className,
}: {
  amount: number;
  suffix?: string;
  note?: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "text-xs",
          inverted ? "text-salt/60" : "text-ink/55",
        )}
      >
        From
      </span>
      <span
        className={cn(
          "tnum text-[1.0625rem] font-semibold",
          inverted ? "text-salt" : "text-ink",
        )}
      >
        {formatLKR(amount)}
      </span>
      <span className={cn("text-xs", inverted ? "text-salt/60" : "text-ink/55")}>
        {suffix}
        {note ? `, ${note}` : ""}
      </span>
    </p>
  );
}

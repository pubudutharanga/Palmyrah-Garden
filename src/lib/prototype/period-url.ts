import { validateWindow } from "@/lib/prototype/pricing";
import {
  formatColomboRange,
  presetsFor,
  type Period,
  type PeriodPreset,
} from "@/lib/prototype/time";

type QueryLike = {
  get(key: string): string | null;
  toString(): string;
};

const PRESET_KEYS = ["now", "tonight", "tomorrow"] as const;

export function readPeriodFromQuery(query: QueryLike, now: number): Period {
  const from = query.get("from");
  const to = query.get("to");
  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const validation = validateWindow(
        { startAt: start.toISOString(), endAt: end.toISOString() },
        new Date(now),
        { allowPast: true },
      );
      if (validation.ok) {
        const presetKey = query.get("preset");
        if (
          presetKey &&
          (PRESET_KEYS as readonly string[]).includes(presetKey)
        ) {
          const preset = presetsFor(new Date(now))[presetKey as (typeof PRESET_KEYS)[number]];
          if (preset.startAt === validation.startAt && preset.endAt === validation.endAt) {
            return preset;
          }
        }
        return {
          startAt: validation.startAt,
          endAt: validation.endAt,
          preset: "custom",
          label: "Custom window",
          description: formatColomboRange(validation.startAt, validation.endAt, {
            compact: true,
          }),
        };
      }
    }
  }
  return presetsFor(new Date(now)).now;
}

export function updateQuery(
  query: QueryLike,
  changes: Record<string, string | null>,
): string {
  const params = new URLSearchParams(query.toString());
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  return params.toString();
}

export function periodChanges(period: Period): Record<string, string> {
  return {
    from: period.startAt,
    to: period.endAt,
    preset: period.preset satisfies PeriodPreset,
  };
}

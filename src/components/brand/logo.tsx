import { cn } from "@/lib/utils";

/** A quiet palmyrah fan mark, drawn as line work. */
export function PalmMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <path
        d="M24 45V19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M24 22C18 15 11 13 4 15.5 10 19 16.5 22 24 25.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 22C30 15 37 13 44 15.5 38 19 31.5 22 24 25.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 15C19.5 8 13 4 6 4.5 10 9.5 16 14 24 18.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 15C28.5 8 35 4 42 4.5 38 9.5 32 14 24 18.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 10V2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  inverted = false,
  short = false,
  hideLocation = false,
  className,
}: {
  inverted?: boolean;
  short?: boolean;
  hideLocation?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 leading-none",
        inverted ? "text-salt" : "text-ink",
        className,
      )}
    >
      <PalmMark className="h-7 w-7 shrink-0" />
      <span className="flex flex-col">
        <span className="font-script text-[1.8rem] leading-[1.1]">
          {short ? "Palmyrah" : "Palmyrah Garden"}
        </span>
        {hideLocation ? null : (
          <span
            className={cn(
              "font-deco mt-0.5 text-[0.6875rem] leading-none tracking-[0.08em]",
              inverted ? "text-salt/65" : "text-ink/55",
            )}
          >
            Madhu, Sri Lanka
          </span>
        )}
      </span>
    </span>
  );
}

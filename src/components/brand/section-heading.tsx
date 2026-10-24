import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
  tone = "light",
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-sm",
            tone === "dark" ? "text-salt/60" : "text-gulf",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "h2 max-w-[18ch]",
          tone === "dark" ? "text-salt" : "text-ink",
          align === "center" ? "max-w-[24ch]" : "",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            "body measure",
            tone === "dark" ? "text-salt/70" : "text-ink/70",
          )}
        >
          {intro}
        </p>
      ) : null}
      {children}
    </div>
  );
}

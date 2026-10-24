import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-input border border-ink/20 bg-salt px-4 py-3 text-[0.9375rem] text-ink shadow-none outline-none transition-colors placeholder:text-ink/40 hover:border-ink/35 focus:border-gulf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gulf disabled:cursor-not-allowed disabled:opacity-50";

export function Input({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  return <input className={cn(fieldBase, "min-h-12", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(fieldBase, "min-h-36 resize-y", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(fieldBase, "min-h-12 appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60"
      />
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink/60">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-jaggery text-ink hover:bg-[#b07d28] active:bg-[#a3731f] border border-transparent",
  secondary:
    "border border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/[0.03]",
  "secondary-dark":
    "border border-salt/35 bg-transparent text-salt hover:border-salt/70 hover:bg-salt/10",
  ghost: "border border-transparent text-ink hover:bg-ink/[0.05]",
  link: "border border-transparent px-0 text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink",
  destructive: "bg-danger text-white hover:bg-[#932e24] border border-transparent",
} as const;

const sizes = {
  sm: "min-h-11 px-4 text-[0.9375rem]",
  md: "min-h-12 px-6 text-[0.9375rem]",
  lg: "min-h-13 px-8 text-base",
  icon: "h-11 w-11 justify-center px-0",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium leading-none transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  asChild?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}

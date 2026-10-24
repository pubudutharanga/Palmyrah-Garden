"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="relative flex min-h-svh items-center overflow-hidden bg-salt py-24">
      <div className="palm-watermark pointer-events-none absolute inset-0 opacity-[0.045]" />
      <div className="shell relative max-w-xl">
        <Link href="/" aria-label="The Palmyrah Garden & Resort, home">
          <Logo />
        </Link>
        <p className="mt-12 text-sm text-gulf">Something went wrong</p>
        <h1 className="h1 mt-3">The garden gate is stuck.</h1>
        <p className="mt-4 text-ink/65">
          This page could not be loaded. Try again; if it keeps happening, write to us
          and we will help.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-ink/40">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button asChild variant="secondary">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

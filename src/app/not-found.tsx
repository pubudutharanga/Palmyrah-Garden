import type { Metadata } from "next";
import Link from "next/link";

import { PrototypeRibbon } from "@/components/brand/prototype-ribbon";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative flex flex-1 items-center overflow-hidden py-32">
        <div className="palm-watermark pointer-events-none absolute inset-0 opacity-[0.045]" />
        <div className="shell relative max-w-2xl">
          <p className="text-sm text-gulf">404</p>
          <h1 className="display-lg mt-4">This path is overgrown.</h1>
          <p className="mt-5 max-w-md text-ink/65">
            The page you were looking for is not here. The garden is still open, and so
            are the rooms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Back to the resort</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/rooms">See the rooms</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-ink/45">
            Need a hand?{" "}
            <Link href="/contact" className="link-quiet">
              Write to us
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
      <PrototypeRibbon />
    </>
  );
}

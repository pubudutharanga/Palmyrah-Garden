import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PrototypeRibbon } from "@/components/brand/prototype-ribbon";
import { resort } from "@/content/resort";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-dune bg-salt">
        <div className="shell flex h-20 items-center justify-between gap-4">
          <Link href="/" aria-label="The Palmyrah Garden & Resort, home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3 text-sm text-ink/60">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Direct booking
            </span>
            <a
              href={`mailto:${resort.contact.email}`}
              className="link-quiet hidden text-ink/70 md:inline"
            >
              Need help?
            </a>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-dune bg-salt py-8">
        <div className="shell flex flex-col gap-3 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {resort.name}. Rates in Sri Lankan rupees.
          </p>
          <div className="flex gap-5">
            <Link href="/policies/cancellation" className="hover:text-ink">
              Cancellation
            </Link>
            <Link href="/policies/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/policies/terms" className="hover:text-ink">
              Terms
            </Link>
          </div>
        </div>
      </footer>
      <PrototypeRibbon />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FaqAccordion } from "@/components/site/faq-accordion";
import { resort } from "@/content/resort";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Practical questions about staying at The Palmyrah Garden & Resort.",
};

export default function FaqPage() {
  return (
    <>
      <section className="pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="shell grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm text-gulf">Before you book</p>
            <h1 className="display-lg mt-5 max-w-[12ch]">Good to know.</h1>
          </div>
          <div className="lg:col-span-5 lg:pt-12">
            <p className="body-lg text-ink/70">
              The practical answers. If your question is not here, write to us and a
              person will answer.
            </p>
          </div>
        </div>
      </section>

      <section className="shell grid gap-12 pb-24 md:pb-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <FaqAccordion />
          <p className="mt-6 text-xs text-ink/45">
            Some operational details are prototype content pending confirmation by the
            resort.
          </p>
        </div>

        <aside className="lg:col-span-3 lg:col-start-10">
          <div className="rounded-panel border border-dune bg-dune/35 p-6">
            <h2 className="h3">Still wondering?</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              Send a note about dates, rooms or the road north. We answer enquiries
              within one working day.
            </p>
            <Link
              href="/contact"
              className="link-quiet mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
            >
              Contact us
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/45">
              Prefer email?{" "}
              <a href={`mailto:${resort.contact.email}`} className="link-quiet break-all">
                {resort.contact.email}
              </a>
            </p>
          </div>

          <div className="mt-5 rounded-panel border border-dune p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/40">Cancellation</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Cancel from your request page until check-in. No online payment is taken;
              an approved guest who does not arrive may lose the room after a 2-hour
              grace period.
            </p>
            <Link
              href="/policies/cancellation"
              className="link-quiet mt-3 inline-flex text-sm"
            >
              Read the policy
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}

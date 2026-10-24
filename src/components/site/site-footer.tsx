import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Newsletter } from "@/components/site/newsletter";
import { resort } from "@/content/resort";
import { todayKey } from "@/lib/dates";

const stayLinks = [
  { href: "/rooms", label: "Live room board" },
  { href: "/book", label: "Request a room" },
  { href: "/explore", label: "Explore Mannar" },
  { href: "/gallery", label: "Gallery" },
];

const practicalLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "Questions" },
  { href: "/policies/cancellation", label: "Cancellation policy" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/admin/room-board", label: "Demo front desk" },
];

export function SiteFooter() {
  const year = todayKey().slice(0, 4);
  const prototype = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";
  return (
    <footer className="relative overflow-hidden bg-ink text-salt">
      <div className="palm-watermark pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="shell relative py-16 md:py-24">
        <div className="grid gap-12 border-b border-salt/15 pb-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo inverted />
            <p className="mt-6 max-w-sm text-salt/65">
              {resort.intro}
            </p>
            <div className="mt-8 space-y-2 text-sm text-salt/60">
              <a
                href={`mailto:${resort.contact.email}`}
                className="inline-flex items-center gap-2 hover:text-salt"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {resort.contact.email}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {resort.location}
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-salt/50">Stay</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {stayLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-salt/80 hover:text-salt">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-salt/50">Practical</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {practicalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-salt/80 hover:text-salt">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-salt/50">Before you come</h2>
            <p className="mt-4 text-sm text-salt/60">
              Rooms are booked in hourly windows, with a 3-hour minimum. The resort
              confirms your request before you pay at the counter.
            </p>
            <Link
              href="/faq"
              className="mt-5 inline-flex items-center gap-1 text-sm text-jaggery hover:underline"
            >
              Read the questions
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="font-display text-2xl text-salt/90">
              Notes from the garden, now and then.
            </p>
            <p className="mt-2 max-w-md text-sm text-salt/55">
              An occasional letter about the north, the season and the rooms.
              No more than once a month.
            </p>
          </div>
          <div className="md:col-span-6 md:justify-self-end md:max-w-md md:w-full">
            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-salt/15 pt-8 text-xs text-salt/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {resort.name}. All rights reserved.
          </p>
          {prototype ? <p>Prototype: sample content and demo data</p> : null}
        </div>
      </div>
    </footer>
  );
}

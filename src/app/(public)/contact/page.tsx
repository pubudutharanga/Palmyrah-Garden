import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { EnquiryForm } from "@/components/site/enquiry-form";
import { contactPage } from "@/content/pages/contact";
import { resort } from "@/content/resort";

export const metadata: Metadata = {
  title: "Contact",
  description: contactPage.intro,
};

const mapQuery = encodeURIComponent(resort.contact.mapQuery);
const mapEmbed = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

export default function ContactPage() {
  return (
    <>
      <section className="pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm text-gulf">{contactPage.eyebrow}</p>
              <h1 className="display-lg mt-5 max-w-[10ch]">{contactPage.title}</h1>
            </div>
            <div className="lg:col-span-5 lg:pt-12">
              <p className="body-lg text-ink/70">{contactPage.intro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell grid gap-12 pb-24 md:pb-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h2 className="h3">{contactPage.form.title}</h2>
          <div className="mt-7">
            <EnquiryForm />
          </div>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="rounded-panel border border-dune bg-dune/35 p-6 sm:p-7">
            <h2 className="h3">{contactPage.details.title}</h2>

            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="flex items-center gap-2 text-ink/45">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {contactPage.details.emailLabel}
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${resort.contact.email}`}
                    className="link-quiet break-all font-medium"
                  >
                    {resort.contact.email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-ink/45">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {contactPage.details.addressLabel}
                </dt>
                <dd className="mt-1.5 text-ink/70">{resort.location}</dd>
              </div>

              <div className="border-t border-ink/10 pt-4">
                <dt className="text-ink/45">{contactPage.details.hoursLabel}</dt>
                <dd className="mt-1.5 text-ink/70">{contactPage.details.hours}</dd>
              </div>
            </dl>

            <p className="mt-6 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/45">
              {contactPage.note}
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-panel border border-dune bg-ink">
            {mapEmbed ? (
              <iframe
                src={mapEmbed}
                title="Map showing the resort's location in Mannar"
                width="100%"
                height="320"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full grayscale-[25%]"
              />
            ) : (
              <div className="relative px-6 py-12 text-salt">
                <div className="palm-watermark pointer-events-none absolute inset-0 opacity-[0.08]" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.14em] text-salt/45">
                    {contactPage.details.mapLabel}
                  </p>
                  <p className="mt-3 font-display text-2xl tracking-[-0.02em]">
                    Between the lagoon and the garden.
                  </p>
                  <p className="mt-2 text-sm text-salt/60">
                    Coordinates {resort.property.coordinates.lat.toFixed(3)},{" "}
                    {resort.property.coordinates.lng.toFixed(3)}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-quiet mt-5 inline-flex items-center gap-1.5 text-sm text-salt"
                  >
                    {contactPage.details.mapLink}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 px-1 text-xs leading-relaxed text-ink/45">
            {resort.contact.responseTime}
          </p>
        </aside>
      </section>
    </>
  );
}

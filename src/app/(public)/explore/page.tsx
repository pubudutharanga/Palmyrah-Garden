import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Compass,
  Info,
  MapPin,
  Sparkles,
  Sun,
} from "lucide-react";

import { ResortImage } from "@/components/brand/resort-image";
import { explorePage } from "@/content/pages/explore";
import { nearbyPlaces } from "@/content/resort";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Explore Mannar | The Palmyrah Garden & Resort",
  description:
    "Discover the historic landmarks, sacred sanctuaries, Ramsar bird wetlands, and coastal edge of Mannar Island, Sri Lanka. Real travel guide with driving times and photography.",
};

export default function ExplorePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-dune pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm font-medium tracking-wide text-gulf">
                {explorePage.eyebrow}
              </p>
              <h1 className="display-lg mt-5 max-w-[12ch]">{explorePage.title}</h1>
            </div>
            <div className="lg:col-span-5 lg:pt-12">
              <p className="body-lg text-ink/75">{explorePage.intro}</p>
              <p className="mt-5 text-sm leading-relaxed text-ink/60">
                {explorePage.note}
              </p>
            </div>
          </div>

          {/* Quick Island Facts */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-y border-dune py-6 sm:grid-cols-4 md:mt-14">
            {explorePage.quickFacts.map((fact) => (
              <div key={fact.label} className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gulf">
                  {fact.label}
                </p>
                <p className="font-serif text-2xl font-light text-ink">
                  {fact.value}
                </p>
                <p className="text-xs text-ink/55">{fact.detail}</p>
              </div>
            ))}
          </div>

          {/* Hero Photograph */}
          <div className="mt-10 md:mt-14">
            <ResortImage
              scene="explore.talaimannar"
              src={explorePage.heroImage.src}
              alt={explorePage.heroImage.alt}
              ratio="21 / 9"
              sizes="100vw"
              priority
            />
            <div className="mt-3 flex flex-col justify-between gap-2 text-xs text-ink/60 sm:flex-row sm:items-center">
              <p className="photo-caption">{explorePage.heroImage.caption}</p>
              <span className="font-mono text-[11px] text-ink/40">
                8.981° N, 79.904° E • Mannar, Sri Lanka
              </span>
            </div>
          </div>

          {/* Jump Navigation Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-ink/45 uppercase tracking-wider mr-1">
              Jump to:
            </span>
            {nearbyPlaces.map((place) => (
              <a
                key={place.id}
                href={`#${place.id}`}
                className="rounded-full border border-dune bg-salt/60 px-3.5 py-1 text-xs text-ink/70 transition-colors hover:border-gulf hover:bg-gulf/5 hover:text-gulf"
              >
                {place.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Landmarks & Attractions Showcase */}
      <div className="shell py-10 md:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-gulf">
            Curated Landmarks & Sanctuaries
          </p>
          <h2 className="h2 mt-2">Places shaped by the sea, wind, and centuries</h2>
          <p className="mt-3 text-sm text-ink/65">
            Each destination has been photographed and detailed with genuine driving times,
            notable highlights, and practical advice from our front desk.
          </p>
        </div>

        {nearbyPlaces.map((place, index) => (
          <article
            key={place.id}
            id={place.id}
            className="scroll-mt-28 border-b border-dune py-16 first:pt-4 last:border-0 md:py-24"
          >
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Photo Column */}
              <div
                className={cn(
                  "lg:col-span-6",
                  index % 2 === 1 ? "lg:order-2 lg:col-start-7" : "lg:col-start-1",
                )}
              >
                <div className="group relative overflow-hidden rounded-photo">
                  <ResortImage
                    scene={place.scene}
                    src={place.src}
                    alt={place.name}
                    ratio={index % 3 === 0 ? "16 / 10" : "4 / 3"}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  {place.category ? (
                    <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium tracking-wide text-salt backdrop-blur-sm">
                      {place.category}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Text & Practical Info Column */}
              <div
                className={cn(
                  "lg:col-span-6",
                  index % 2 === 1 ? "lg:order-1 lg:col-start-1" : "lg:col-start-7",
                )}
              >
                {/* Meta pills row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink/65">
                  {place.distance ? (
                    <span className="inline-flex items-center gap-1 rounded bg-dune/60 px-2.5 py-1 font-medium text-ink/80">
                      <MapPin className="h-3 w-3 text-gulf" aria-hidden="true" />
                      {place.distance}
                    </span>
                  ) : null}
                  {place.travelTime ? (
                    <span className="inline-flex items-center gap-1 rounded bg-dune/60 px-2.5 py-1 text-ink/75">
                      <Clock className="h-3 w-3 text-gulf" aria-hidden="true" />
                      {place.travelTime}
                    </span>
                  ) : null}
                  {place.bestTime ? (
                    <span className="inline-flex items-center gap-1 rounded bg-dune/60 px-2.5 py-1 text-ink/75">
                      <Sun className="h-3 w-3 text-jaggery" aria-hidden="true" />
                      {place.bestTime}
                    </span>
                  ) : null}
                </div>

                <h3 className="h2 mt-4 text-ink">{place.name}</h3>
                <p className="mt-3 body-lg text-ink/75">{place.intro}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink/65">{place.body}</p>

                {/* Highlights List */}
                {place.highlights && place.highlights.length > 0 ? (
                  <div className="mt-5 space-y-2 border-t border-dune/60 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gulf">
                      Notable Highlights
                    </p>
                    <ul className="space-y-1.5 text-xs text-ink/70">
                      {place.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gulf" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Practical Tips Box */}
                {place.practicalTips ? (
                  <div className="mt-5 rounded-md border border-dune bg-salt/80 p-3.5 text-xs leading-relaxed text-ink/65">
                    <p className="flex items-center gap-1.5 font-medium text-ink/80">
                      <Info className="h-3.5 w-3.5 text-gulf" aria-hidden="true" />
                      Visitor Guidance
                    </p>
                    <p className="mt-1">{place.practicalTips}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Suggested Curated Itineraries Section */}
      <section className="border-t border-dune bg-dune/25 py-20 md:py-28">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-gulf">
              Suggested Journeys
            </p>
            <h2 className="display-lg mt-3">Three Ways to Spend a Day</h2>
            <p className="mt-4 body-lg text-ink/70">
              Mannar rewards those who do not rush. Here are three tested routes starting
              and ending at our garden gate.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {explorePage.suggestedDays.map((day, idx) => (
              <div
                key={day.title}
                className="flex flex-col justify-between rounded-panel border border-dune bg-salt p-7 transition-all duration-300 hover:border-gulf/50 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-gulf/10 px-3 py-0.5 text-xs font-medium text-gulf">
                      Route 0{idx + 1}
                    </span>
                    <span className="text-xs text-ink/50">{day.duration}</span>
                  </div>

                  <h3 className="h3 mt-5 text-xl font-normal text-ink">{day.title}</h3>
                  <p className="text-xs font-medium text-gulf">{day.subtitle}</p>

                  <p className="mt-4 text-xs leading-relaxed text-ink/65">
                    {day.description}
                  </p>

                  <div className="mt-6 border-t border-dune/70 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                      Itinerary Stops
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-ink/70">
                      {day.stops.map((stop) => (
                        <li key={stop} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-jaggery" />
                          <span>{stop}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href="/contact"
                    className="link-quiet inline-flex items-center gap-1.5 text-xs font-medium text-ink"
                  >
                    Ask our team to arrange this
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Front Desk Support & Excursion Planning CTA */}
      <section className="relative overflow-hidden bg-ink py-20 text-salt md:py-24">
        <div className="palm-watermark pointer-events-none absolute inset-0 opacity-[0.06]" />
        <div className="shell relative grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-salt/60 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-jaggery" aria-hidden="true" />
              Front Desk Service
            </span>
            <h2 className="h2 mt-3 text-salt">{explorePage.closing.title}</h2>
            <p className="mt-4 max-w-xl text-salt/70 leading-relaxed">
              {explorePage.closing.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-salt/60">
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-salt/80" /> Private car & tuk-tuk hires
              </span>
              <span className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-salt/80" /> Packed dawn breakfast boxes
              </span>
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-salt/80" /> Daily tide & sanctuary guidance
              </span>
            </div>
          </div>
          <div className="md:col-span-5 md:text-right">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-salt px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-105"
            >
              Ask us to plan your excursion
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
